import { describe, expect, it, vi, beforeEach } from "vitest"

const cartaoCreateMock = vi.fn()
const cartaoFindManyMock = vi.fn()
const cartaoCountMock = vi.fn()
const cartaoFindUniqueMock = vi.fn()
const cartaoUpdateMock = vi.fn()
const cartaoDeleteMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    cartao: {
      create: (...args: unknown[]) => cartaoCreateMock(...args),
      findMany: (...args: unknown[]) => cartaoFindManyMock(...args),
      count: (...args: unknown[]) => cartaoCountMock(...args),
      findUnique: (...args: unknown[]) => cartaoFindUniqueMock(...args),
      update: (...args: unknown[]) => cartaoUpdateMock(...args),
      delete: (...args: unknown[]) => cartaoDeleteMock(...args),
    },
  },
}))

const { criar, listar, buscarPorId, atualizar, deletar } = await import("../src/services/cartaoService")
const { AppError } = await import("../src/utils/AppError")

describe("cartaoService", () => {
  beforeEach(() => {
    cartaoCreateMock.mockReset()
    cartaoFindManyMock.mockReset()
    cartaoCountMock.mockReset()
    cartaoFindUniqueMock.mockReset()
    cartaoUpdateMock.mockReset()
    cartaoDeleteMock.mockReset()
  })

  it("criar cria o cartão sem devolver o cvv", async () => {
    cartaoCreateMock.mockResolvedValue({ id: 1, numero: "1111-2222-3333-4444" })
    await criar({ numero: "1111-2222-3333-4444", validade: "12/30", cvv: "123", tipo: "debito", limite: 0, contaId: 1 })
    expect(cartaoCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ select: expect.not.objectContaining({ cvv: true }) }),
    )
  })

  it("listar pagina os resultados", async () => {
    cartaoCountMock.mockResolvedValue(0)
    cartaoFindManyMock.mockResolvedValue([])
    const resultado = await listar({ page: 1, limit: 20 })
    expect(resultado).toEqual({ dados: [], total: 0, pagina: 1, totalPaginas: 1 })
  })

  it("buscarPorId lança 404 quando o cartão não existe", async () => {
    cartaoFindUniqueMock.mockResolvedValue(null)
    await expect(buscarPorId(999)).rejects.toMatchObject({ statusCode: 404 })
  })

  it("buscarPorId retorna o cartão quando encontrado", async () => {
    cartaoFindUniqueMock.mockResolvedValue({ id: 1, numero: "1111-2222-3333-4444" })
    const cartao = await buscarPorId(1)
    expect(cartao.id).toBe(1)
  })

  it("atualizar repassa os dados para o prisma", async () => {
    cartaoUpdateMock.mockResolvedValue({ id: 1, limite: 500 })
    await atualizar(1, { limite: 500 })
    expect(cartaoUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { limite: 500 } }),
    )
  })

  it("deletar remove o cartão pelo id", async () => {
    cartaoDeleteMock.mockResolvedValue({ id: 1 })
    await deletar(1)
    expect(cartaoDeleteMock).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it("AppError é usado para o 404 de buscarPorId", async () => {
    cartaoFindUniqueMock.mockResolvedValue(null)
    await expect(buscarPorId(1)).rejects.toBeInstanceOf(AppError)
  })
})
