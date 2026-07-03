import { describe, expect, it, vi, beforeEach } from "vitest"
import { Prisma } from "../generated/prisma"

const contaFindUniqueMock = vi.fn()
const contaUpdateMock = vi.fn()
const transacaoCreateMock = vi.fn((args: { data: unknown }) => args.data)

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        conta: { findUnique: contaFindUniqueMock, update: contaUpdateMock },
        transacao: { create: transacaoCreateMock },
      }),
  },
}))

const { deposito, saque, transferencia } = await import("../src/services/transacaoService")
const { AppError } = await import("../src/utils/AppError")

const conta = (saldo: number) => ({
  id: 1,
  saldo: new Prisma.Decimal(saldo),
  numeroConta: "1001",
  tipo: "corrente",
})

describe("transacaoService", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    contaUpdateMock.mockReset()
    transacaoCreateMock.mockClear()
  })

  it("deposito soma o valor ao saldo da conta", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(100))
    await deposito({ contaId: 1, valor: 50 })
    expect(contaUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }))
    const saldoAtualizado = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoAtualizado.toNumber()).toBe(150)
  })

  it("saque rejeita quando o saldo é insuficiente", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(30))
    await expect(saque({ contaId: 1, valor: 50 })).rejects.toThrow(AppError)
    expect(contaUpdateMock).not.toHaveBeenCalled()
  })

  it("saque subtrai o valor quando há saldo suficiente", async () => {
    contaFindUniqueMock.mockResolvedValue(conta(100))
    await saque({ contaId: 1, valor: 40 })
    const saldoAtualizado = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoAtualizado.toNumber()).toBe(60)
  })

  it("transferencia move o valor da origem para o destino", async () => {
    contaFindUniqueMock.mockResolvedValueOnce(conta(200)).mockResolvedValueOnce(conta(10))
    await transferencia({ origemId: 1, destinoId: 2, valor: 70 })

    const saldoOrigem = contaUpdateMock.mock.calls[0][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    const saldoDestino = contaUpdateMock.mock.calls[1][0].data.saldo as InstanceType<typeof Prisma.Decimal>
    expect(saldoOrigem.toNumber()).toBe(130)
    expect(saldoDestino.toNumber()).toBe(80)
  })

  it("transferencia rejeita quando a conta de origem não tem saldo suficiente", async () => {
    contaFindUniqueMock.mockResolvedValueOnce(conta(10)).mockResolvedValueOnce(conta(10))
    await expect(transferencia({ origemId: 1, destinoId: 2, valor: 70 })).rejects.toThrow(AppError)
    expect(contaUpdateMock).not.toHaveBeenCalled()
  })
})
