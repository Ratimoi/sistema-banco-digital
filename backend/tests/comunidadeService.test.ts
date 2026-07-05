import { describe, expect, it, vi, beforeEach } from "vitest"

const postCreateMock = vi.fn()
const postFindManyMock = vi.fn()
const postFindUniqueMock = vi.fn()
const postDeleteMock = vi.fn()
const postDeleteManyMock = vi.fn()
const removerMidiaMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    post: {
      create: (...args: unknown[]) => postCreateMock(...args),
      findMany: (...args: unknown[]) => postFindManyMock(...args),
      findUnique: (...args: unknown[]) => postFindUniqueMock(...args),
      delete: (...args: unknown[]) => postDeleteMock(...args),
      deleteMany: (...args: unknown[]) => postDeleteManyMock(...args),
    },
  },
}))

vi.mock("../src/services/uploadService", () => ({
  removerMidia: (...args: unknown[]) => removerMidiaMock(...args),
}))

const { criar, listar, deletar } = await import("../src/services/comunidadeService")

describe("comunidadeService", () => {
  beforeEach(() => {
    postCreateMock.mockReset()
    postFindManyMock.mockReset()
    postFindUniqueMock.mockReset()
    postDeleteMock.mockReset()
    postDeleteManyMock.mockReset()
    removerMidiaMock.mockReset()
    removerMidiaMock.mockResolvedValue(undefined)
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

  it("ao listar, apaga posts com mais de 30 dias e remove a mídia associada", async () => {
    const antigos = [
      { id: 1, midiaUrl: "https://x.supabase.co/storage/v1/object/public/comunidade-midia/foo.png" },
      { id: 2, midiaUrl: null },
    ]
    postFindManyMock.mockImplementation((args: { where?: { createdAt?: unknown } }) =>
      Promise.resolve(args?.where?.createdAt ? antigos : []),
    )
    postDeleteManyMock.mockResolvedValue({ count: 2 })

    await listar()

    expect(removerMidiaMock).toHaveBeenCalledTimes(1)
    expect(removerMidiaMock).toHaveBeenCalledWith(antigos[0].midiaUrl)
    expect(postDeleteManyMock).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } })
  })

  it("ao listar, não deleta nada quando não há posts antigos", async () => {
    postFindManyMock.mockResolvedValue([])
    await listar()
    expect(postDeleteManyMock).not.toHaveBeenCalled()
    expect(removerMidiaMock).not.toHaveBeenCalled()
  })

  it("deletar remove a mídia do post antes de excluí-lo", async () => {
    const midiaUrl = "https://x.supabase.co/storage/v1/object/public/comunidade-midia/bar.mp4"
    postFindUniqueMock.mockResolvedValue({ id: 3, midiaUrl })
    postDeleteMock.mockResolvedValue({ id: 3 })

    await deletar(3)

    expect(removerMidiaMock).toHaveBeenCalledWith(midiaUrl)
    expect(postDeleteMock).toHaveBeenCalledWith({ where: { id: 3 } })
  })

  it("deletar não chama removerMidia quando o post não tem mídia", async () => {
    postFindUniqueMock.mockResolvedValue({ id: 4, midiaUrl: null })
    postDeleteMock.mockResolvedValue({ id: 4 })

    await deletar(4)

    expect(removerMidiaMock).not.toHaveBeenCalled()
  })
})
