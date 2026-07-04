import { describe, expect, it, vi, beforeEach } from "vitest"
import { Prisma } from "../generated/prisma"

const emprestimoFindUniqueMock = vi.fn()
const emprestimoUpdateMock = vi.fn()
const contaFindUniqueMock = vi.fn()
const contaUpdateMock = vi.fn()
const transacaoCreateMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    emprestimo: {
      findUnique: (...args: unknown[]) => emprestimoFindUniqueMock(...args),
      update: (...args: unknown[]) => emprestimoUpdateMock(...args),
    },
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        emprestimo: { findUnique: emprestimoFindUniqueMock, update: emprestimoUpdateMock },
        conta: { findUnique: contaFindUniqueMock, update: contaUpdateMock },
        transacao: { create: transacaoCreateMock },
      }),
  },
}))

const { aprovar, rejeitar } = await import("../src/services/emprestimoService")

const emprestimoPendente = () => ({
  id: 1,
  valor: new Prisma.Decimal(300),
  taxaJuros: new Prisma.Decimal(2.5),
  parcelas: 6,
  status: "pendente",
  clienteId: 10,
})

describe("emprestimoService.aprovar", () => {
  beforeEach(() => {
    emprestimoFindUniqueMock.mockReset()
    emprestimoUpdateMock.mockReset()
    contaFindUniqueMock.mockReset()
    contaUpdateMock.mockReset()
    transacaoCreateMock.mockReset()
  })

  it("rejeita quando o empréstimo não existe", async () => {
    emprestimoFindUniqueMock.mockResolvedValue(null)
    await expect(aprovar(1)).rejects.toMatchObject({ statusCode: 404 })
  })

  it("rejeita quando o empréstimo já foi processado", async () => {
    emprestimoFindUniqueMock.mockResolvedValue({ ...emprestimoPendente(), status: "ativo" })
    await expect(aprovar(1)).rejects.toMatchObject({ statusCode: 409 })
    expect(contaUpdateMock).not.toHaveBeenCalled()
  })

  it("credita o valor na conta, registra a transação e ativa o empréstimo", async () => {
    emprestimoFindUniqueMock.mockResolvedValue(emprestimoPendente())
    contaFindUniqueMock.mockResolvedValue({ id: 1, saldo: new Prisma.Decimal(100), clienteId: 10 })
    emprestimoUpdateMock.mockResolvedValue({ ...emprestimoPendente(), status: "ativo" })

    await aprovar(1)

    const saldoAtualizado = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoAtualizado.toNumber()).toBe(400)
    expect(transacaoCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: "EMPRESTIMO_LIBERADO" }) }),
    )
    expect(emprestimoUpdateMock).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: "ativo" } })
  })
})

describe("emprestimoService.rejeitar", () => {
  beforeEach(() => {
    emprestimoFindUniqueMock.mockReset()
    emprestimoUpdateMock.mockReset()
  })

  it("rejeita quando o empréstimo não existe", async () => {
    emprestimoFindUniqueMock.mockResolvedValue(null)
    await expect(rejeitar(1)).rejects.toMatchObject({ statusCode: 404 })
  })

  it("rejeita quando o empréstimo já foi processado", async () => {
    emprestimoFindUniqueMock.mockResolvedValue({ ...emprestimoPendente(), status: "rejeitado" })
    await expect(rejeitar(1)).rejects.toMatchObject({ statusCode: 409 })
  })

  it("muda o status para rejeitado sem alterar saldo", async () => {
    emprestimoFindUniqueMock.mockResolvedValue(emprestimoPendente())
    emprestimoUpdateMock.mockResolvedValue({ ...emprestimoPendente(), status: "rejeitado" })
    await rejeitar(1)
    expect(emprestimoUpdateMock).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: "rejeitado" } })
  })
})
