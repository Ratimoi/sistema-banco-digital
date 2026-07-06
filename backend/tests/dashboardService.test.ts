import { describe, expect, it, vi, beforeEach } from "vitest"

const clienteCountMock = vi.fn()
const contaCountMock = vi.fn()
const transacaoCountMock = vi.fn()
const emprestimoCountMock = vi.fn()
const contaAggregateMock = vi.fn()
const transacaoFindManyMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    cliente: { count: (...args: unknown[]) => clienteCountMock(...args) },
    conta: {
      count: (...args: unknown[]) => contaCountMock(...args),
      aggregate: (...args: unknown[]) => contaAggregateMock(...args),
    },
    transacao: {
      count: (...args: unknown[]) => transacaoCountMock(...args),
      findMany: (...args: unknown[]) => transacaoFindManyMock(...args),
    },
    emprestimo: { count: (...args: unknown[]) => emprestimoCountMock(...args) },
  },
}))

const { obterStats } = await import("../src/services/dashboardService")

describe("dashboardService.obterStats", () => {
  beforeEach(() => {
    clienteCountMock.mockReset()
    contaCountMock.mockReset()
    transacaoCountMock.mockReset()
    emprestimoCountMock.mockReset()
    contaAggregateMock.mockReset()
    transacaoFindManyMock.mockReset()
  })

  it("agrega as contagens e o saldo total das contas", async () => {
    clienteCountMock.mockResolvedValue(3)
    contaCountMock.mockResolvedValue(3)
    transacaoCountMock.mockResolvedValue(10)
    emprestimoCountMock.mockResolvedValue(2)
    contaAggregateMock.mockResolvedValue({ _sum: { saldo: 5000 } })
    transacaoFindManyMock.mockResolvedValue([{ id: 10 }])

    const stats = await obterStats()

    expect(stats).toEqual({
      clientes: 3,
      contas: 3,
      transacoes: 10,
      emprestimos: 2,
      saldoTotal: 5000,
      ultimasTransacoes: [{ id: 10 }],
    })
  })

  it("usa 0 como saldoTotal quando a agregação não retorna soma", async () => {
    clienteCountMock.mockResolvedValue(0)
    contaCountMock.mockResolvedValue(0)
    transacaoCountMock.mockResolvedValue(0)
    emprestimoCountMock.mockResolvedValue(0)
    contaAggregateMock.mockResolvedValue({ _sum: { saldo: null } })
    transacaoFindManyMock.mockResolvedValue([])

    const stats = await obterStats()

    expect(stats.saldoTotal).toBe(0)
  })

  it("busca só as 5 transações mais recentes", async () => {
    clienteCountMock.mockResolvedValue(0)
    contaCountMock.mockResolvedValue(0)
    transacaoCountMock.mockResolvedValue(0)
    emprestimoCountMock.mockResolvedValue(0)
    contaAggregateMock.mockResolvedValue({ _sum: { saldo: 0 } })
    transacaoFindManyMock.mockResolvedValue([])

    await obterStats()

    expect(transacaoFindManyMock).toHaveBeenCalledWith({ orderBy: { id: "desc" }, take: 5 })
  })
})
