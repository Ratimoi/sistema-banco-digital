import { describe, expect, it, vi, beforeEach } from "vitest"

const clienteCreateMock = vi.fn()
const clienteFindManyMock = vi.fn()
const clienteCountMock = vi.fn()
const clienteFindUniqueMock = vi.fn()
const clienteUpdateMock = vi.fn()
const clienteDeleteMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    cliente: {
      create: (...args: unknown[]) => clienteCreateMock(...args),
      findMany: (...args: unknown[]) => clienteFindManyMock(...args),
      count: (...args: unknown[]) => clienteCountMock(...args),
      findUnique: (...args: unknown[]) => clienteFindUniqueMock(...args),
      update: (...args: unknown[]) => clienteUpdateMock(...args),
      delete: (...args: unknown[]) => clienteDeleteMock(...args),
    },
  },
}))

const { criar, listar, buscarPorId, atualizar, deletar } = await import("../src/services/clienteService")

describe("clienteService", () => {
  beforeEach(() => {
    clienteCreateMock.mockReset()
    clienteFindManyMock.mockReset()
    clienteCountMock.mockReset()
    clienteFindUniqueMock.mockReset()
    clienteUpdateMock.mockReset()
    clienteDeleteMock.mockReset()
  })

  it("criar faz o hash da senha antes de gravar", async () => {
    clienteCreateMock.mockResolvedValue({ id: 1, nome: "Teste" })
    await criar({ nome: "Teste", cpf: "11122233344", email: "teste@banco.com", senha: "SenhaForte123!", nivel: 0 })

    const dados = clienteCreateMock.mock.calls[0][0].data
    expect(dados.senha).not.toBe("SenhaForte123!")
    expect(dados.senha).toEqual(expect.any(String))
    expect(dados.nome).toBe("Teste")
  })

  it("criar nunca seleciona a senha de volta", async () => {
    clienteCreateMock.mockResolvedValue({ id: 1 })
    await criar({ nome: "Teste", cpf: "11122233344", email: "teste@banco.com", senha: "SenhaForte123!", nivel: 0 })
    const select = clienteCreateMock.mock.calls[0][0].select
    expect(select.senha).toBeUndefined()
  })

  it("listar pagina os resultados incluindo a conta", async () => {
    clienteCountMock.mockResolvedValue(1)
    clienteFindManyMock.mockResolvedValue([{ id: 1 }])
    const resultado = await listar({ page: 1, limit: 20 })
    expect(resultado.total).toBe(1)
    expect(clienteFindManyMock.mock.calls[0][0].select.conta).toBe(true)
  })

  it("buscarPorId inclui conta e empréstimos", async () => {
    clienteFindUniqueMock.mockResolvedValue({ id: 1 })
    await buscarPorId(1)
    const select = clienteFindUniqueMock.mock.calls[0][0].select
    expect(select.conta).toBe(true)
    expect(select.emprestimos).toBe(true)
  })

  it("atualizar faz o hash da nova senha quando informada", async () => {
    clienteUpdateMock.mockResolvedValue({ id: 1 })
    await atualizar(1, { senha: "NovaSenha123!" })
    const dados = clienteUpdateMock.mock.calls[0][0].data
    expect(dados.senha).not.toBe("NovaSenha123!")
  })

  it("atualizar mantém a senha undefined quando não informada (não altera)", async () => {
    clienteUpdateMock.mockResolvedValue({ id: 1 })
    await atualizar(1, { nome: "Novo Nome" })
    const dados = clienteUpdateMock.mock.calls[0][0].data
    expect(dados.senha).toBeUndefined()
    expect(dados.nome).toBe("Novo Nome")
  })

  it("deletar remove o cliente pelo id", async () => {
    clienteDeleteMock.mockResolvedValue({ id: 1 })
    await deletar(1)
    expect(clienteDeleteMock).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})
