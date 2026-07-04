import { describe, expect, it, vi, beforeEach } from "vitest"

const postCreateMock = vi.fn()
const postFindManyMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    post: {
      create: (...args: unknown[]) => postCreateMock(...args),
      findMany: (...args: unknown[]) => postFindManyMock(...args),
    },
  },
}))

const { criar, listar } = await import("../src/services/comunidadeService")

describe("comunidadeService", () => {
  beforeEach(() => {
    postCreateMock.mockReset()
    postFindManyMock.mockReset()
  })

  it("cria um post associado ao clienteId informado, nunca ao do corpo", async () => {
    postCreateMock.mockResolvedValue({ id: 1, conteudo: "Olá", clienteId: 5 })
    await criar(5, { conteudo: "Olá" })
    expect(postCreateMock).toHaveBeenCalledWith({
      data: { conteudo: "Olá", clienteId: 5 },
      include: { cliente: { select: { id: true, nome: true } } },
    })
  })

  it("lista posts em ordem cronológica decrescente", async () => {
    postFindManyMock.mockResolvedValue([])
    await listar()
    expect(postFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } }),
    )
  })
})
