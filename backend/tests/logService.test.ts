import { describe, expect, it, vi, beforeEach } from "vitest"

const logCreateMock = vi.fn()
const logFindManyMock = vi.fn()
const logCountMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    log: {
      create: (...args: unknown[]) => logCreateMock(...args),
      findMany: (...args: unknown[]) => logFindManyMock(...args),
      count: (...args: unknown[]) => logCountMock(...args),
    },
  },
}))

const { registrarLog, listarLogs } = await import("../src/services/logService")

describe("logService", () => {
  beforeEach(() => {
    logCreateMock.mockReset()
    logFindManyMock.mockReset()
    logCountMock.mockReset()
  })

  it("registrarLog grava clienteId, acao e detalhe", async () => {
    logCreateMock.mockResolvedValue({ id: 1 })
    await registrarLog(5, "LOGIN_SUCESSO", "detalhe qualquer")
    expect(logCreateMock).toHaveBeenCalledWith({
      data: { clienteId: 5, acao: "LOGIN_SUCESSO", detalhe: "detalhe qualquer" },
    })
  })

  it("registrarLog aceita clienteId nulo (ação sem cliente identificado)", async () => {
    logCreateMock.mockResolvedValue({ id: 1 })
    await registrarLog(null, "ACAO_SISTEMA")
    expect(logCreateMock).toHaveBeenCalledWith({
      data: { clienteId: null, acao: "ACAO_SISTEMA", detalhe: undefined },
    })
  })

  it("listarLogs pagina os resultados em ordem decrescente por id", async () => {
    logCountMock.mockResolvedValue(1)
    logFindManyMock.mockResolvedValue([{ id: 1, acao: "LOGIN_SUCESSO" }])

    const resultado = await listarLogs({ page: 1, limit: 20 })

    expect(resultado).toEqual({
      dados: [{ id: 1, acao: "LOGIN_SUCESSO" }],
      total: 1,
      pagina: 1,
      totalPaginas: 1,
    })
    expect(logFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: "desc" } }),
    )
  })
})
