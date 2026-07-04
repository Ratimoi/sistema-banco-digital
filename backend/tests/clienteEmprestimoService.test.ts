import { describe, expect, it, vi, beforeEach } from "vitest"
import { Prisma } from "../generated/prisma"

const contaFindUniqueMock = vi.fn()
const cartaoFindUniqueMock = vi.fn()
const emprestimoCreateMock = vi.fn()
const emprestimoFindManyMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    conta: { findUnique: (...args: unknown[]) => contaFindUniqueMock(...args) },
    cartao: { findUnique: (...args: unknown[]) => cartaoFindUniqueMock(...args) },
    emprestimo: {
      create: (...args: unknown[]) => emprestimoCreateMock(...args),
      findMany: (...args: unknown[]) => emprestimoFindManyMock(...args),
    },
  },
}))

const { solicitar, listarPorCliente } = await import("../src/services/clienteEmprestimoService")

const conta = (clienteId: number) => ({ id: 1, clienteId, numeroConta: "1001", saldo: new Prisma.Decimal(0) })
const cartao = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  numero: "4444-3333-2222-1111",
  tipo: "credito",
  limite: new Prisma.Decimal(500),
  contaId: 1,
  ...overrides,
})

describe("clienteEmprestimoService.solicitar", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    cartaoFindUniqueMock.mockReset()
    emprestimoCreateMock.mockReset()
  })

  it("rejeita quando o cartão é de débito", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ tipo: "debito" }))
    await expect(
      solicitar({ clienteId: 10, cartaoNumero: "4444-3333-2222-1111", valor: 100, parcelas: 3 }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(emprestimoCreateMock).not.toHaveBeenCalled()
  })

  it("rejeita quando o valor excede o limite do cartão", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ limite: new Prisma.Decimal(200) }))
    await expect(
      solicitar({ clienteId: 10, cartaoNumero: "4444-3333-2222-1111", valor: 300, parcelas: 3 }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(emprestimoCreateMock).not.toHaveBeenCalled()
  })

  it("rejeita quando o cartão pertence a outra conta", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ contaId: 999 }))
    await expect(
      solicitar({ clienteId: 10, cartaoNumero: "4444-3333-2222-1111", valor: 100, parcelas: 3 }),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it("cria um empréstimo pendente quando o valor está dentro do limite", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(10))
    cartaoFindUniqueMock.mockResolvedValue(cartao())
    emprestimoCreateMock.mockResolvedValue({ id: 1, valor: 300, status: "pendente" })

    await solicitar({ clienteId: 10, cartaoNumero: "4444-3333-2222-1111", valor: 300, parcelas: 6 })

    expect(emprestimoCreateMock).toHaveBeenCalledWith({
      data: { valor: 300, taxaJuros: 2.5, parcelas: 6, status: "pendente", clienteId: 10 },
    })
  })
})

describe("clienteEmprestimoService.listarPorCliente", () => {
  it("lista apenas os empréstimos do cliente informado", async () => {
    emprestimoFindManyMock.mockResolvedValue([])
    await listarPorCliente(10)
    expect(emprestimoFindManyMock).toHaveBeenCalledWith({ where: { clienteId: 10 }, orderBy: { id: "desc" } })
  })
})
