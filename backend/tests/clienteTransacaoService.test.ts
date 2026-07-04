import { describe, expect, it, vi, beforeEach } from "vitest"
import { Prisma } from "../generated/prisma"

const contaFindUniqueMock = vi.fn()
const contaUpdateMock = vi.fn()
const cartaoFindUniqueMock = vi.fn()
const transacaoCreateMock = vi.fn((args: { data: unknown }) => args.data)

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        conta: { findUnique: contaFindUniqueMock, update: contaUpdateMock },
        cartao: { findUnique: cartaoFindUniqueMock },
        transacao: { create: transacaoCreateMock },
      }),
  },
}))

const { saquePorCartao, transferenciaPorCartao } = await import("../src/services/clienteTransacaoService")

const conta = (id: number, saldo: number, clienteId: number) => ({
  id,
  saldo: new Prisma.Decimal(saldo),
  numeroConta: `100${id}`,
  tipo: "corrente",
  clienteId,
})

const cartao = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  numero: "1111-2222-3333-4444",
  tipo: "debito",
  limite: new Prisma.Decimal(1000),
  contaId: 1,
  ...overrides,
})

describe("clienteTransacaoService.saquePorCartao", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    contaUpdateMock.mockReset()
    cartaoFindUniqueMock.mockReset()
    transacaoCreateMock.mockClear()
  })

  it("rejeita saque com cartão de crédito", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(1, 500, 10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ tipo: "credito" }))
    await expect(
      saquePorCartao({ clienteId: 10, cartaoNumero: "1111-2222-3333-4444", valor: 100 }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(contaUpdateMock).not.toHaveBeenCalled()
  })

  it("rejeita saque quando o cartão pertence a outra conta", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(1, 500, 10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ contaId: 999 }))
    await expect(
      saquePorCartao({ clienteId: 10, cartaoNumero: "1111-2222-3333-4444", valor: 100 }),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it("rejeita saque no débito quando o saldo é insuficiente", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(1, 30, 10))
    cartaoFindUniqueMock.mockResolvedValue(cartao())
    await expect(
      saquePorCartao({ clienteId: 10, cartaoNumero: "1111-2222-3333-4444", valor: 100 }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it("realiza o saque no débito quando há saldo suficiente", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(1, 500, 10))
    cartaoFindUniqueMock.mockResolvedValue(cartao())
    await saquePorCartao({ clienteId: 10, cartaoNumero: "1111-2222-3333-4444", valor: 100 })
    const saldoAtualizado = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoAtualizado.toNumber()).toBe(400)
  })
})

describe("clienteTransacaoService.transferenciaPorCartao", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    contaUpdateMock.mockReset()
    cartaoFindUniqueMock.mockReset()
    transacaoCreateMock.mockClear()
  })

  it("rejeita quando o cartão de destino não existe", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(1, 500, 10))
    cartaoFindUniqueMock.mockResolvedValue(null)
    await expect(
      transferenciaPorCartao({ clienteId: 10, cartaoNumeroDestino: "0000-0000-0000-0000", valor: 50 }),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it("rejeita transferência para a própria conta", async () => {
    contaFindUniqueMock.mockResolvedValueOnce(conta(1, 500, 10))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ contaId: 1 }))
    await expect(
      transferenciaPorCartao({ clienteId: 10, cartaoNumeroDestino: "1111-2222-3333-4444", valor: 50 }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it("move o saldo da origem para a conta resolvida pelo cartão de destino", async () => {
    // 1ª chamada: busca a própria conta por clienteId. 2ª e 3ª: dentro de executarTransferencia
    // (busca origem e destino por id).
    contaFindUniqueMock
      .mockResolvedValueOnce(conta(1, 500, 10))
      .mockResolvedValueOnce(conta(1, 500, 10))
      .mockResolvedValueOnce(conta(2, 20, 20))
    cartaoFindUniqueMock.mockResolvedValue(cartao({ contaId: 2 }))
    await transferenciaPorCartao({ clienteId: 10, cartaoNumeroDestino: "1111-2222-3333-4444", valor: 50 })
    const saldoOrigem = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    const saldoDestino = contaUpdateMock.mock.calls[1][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoOrigem.toNumber()).toBe(450)
    expect(saldoDestino.toNumber()).toBe(70)
  })
})
