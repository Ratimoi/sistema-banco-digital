import { describe, expect, it, vi, beforeEach } from "vitest"

const contaCreateMock = vi.fn()
const contaFindManyMock = vi.fn()
const contaCountMock = vi.fn()
const contaFindUniqueMock = vi.fn()
const contaUpdateMock = vi.fn()
const contaDeleteMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    conta: {
      create: (...args: unknown[]) => contaCreateMock(...args),
      findMany: (...args: unknown[]) => contaFindManyMock(...args),
      count: (...args: unknown[]) => contaCountMock(...args),
      findUnique: (...args: unknown[]) => contaFindUniqueMock(...args),
      update: (...args: unknown[]) => contaUpdateMock(...args),
      delete: (...args: unknown[]) => contaDeleteMock(...args),
    },
  },
}))

const { criar, listar, buscarPorId, listarPorCliente, buscarPorCliente, atualizar, deletar } = await import(
  "../src/services/contaService"
)
const { AppError } = await import("../src/utils/AppError")

describe("contaService", () => {
  beforeEach(() => {
    contaCreateMock.mockReset()
    contaFindManyMock.mockReset()
    contaCountMock.mockReset()
    contaFindUniqueMock.mockReset()
    contaUpdateMock.mockReset()
    contaDeleteMock.mockReset()
  })

  it("criar repassa os dados para o prisma", async () => {
    contaCreateMock.mockResolvedValue({ id: 1 })
    await criar({ numeroConta: "1001", tipo: "corrente", saldo: 0, clienteId: 1 })
    expect(contaCreateMock).toHaveBeenCalledWith({
      data: { numeroConta: "1001", tipo: "corrente", saldo: 0, clienteId: 1 },
    })
  })

  it("listar pagina os resultados", async () => {
    contaCountMock.mockResolvedValue(1)
    contaFindManyMock.mockResolvedValue([{ id: 1 }])
    const resultado = await listar({ page: 1, limit: 20 })
    expect(resultado.total).toBe(1)
    expect(resultado.dados).toHaveLength(1)
  })

  it("buscarPorId lança 404 quando a conta não existe", async () => {
    contaFindUniqueMock.mockResolvedValue(null)
    await expect(buscarPorId(999)).rejects.toMatchObject({ statusCode: 404 })
  })

  it("buscarPorId inclui cartões e as 50 transações mais recentes", async () => {
    contaFindUniqueMock.mockResolvedValue({ id: 1 })
    await buscarPorId(1)
    const args = contaFindUniqueMock.mock.calls[0][0]
    expect(args.include.transacoesEnviadas).toEqual({ orderBy: { createdAt: "desc" }, take: 50 })
    expect(args.include.transacoesRecebidas).toEqual({ orderBy: { createdAt: "desc" }, take: 50 })
  })

  it("listarPorCliente filtra pelo clienteId", async () => {
    contaFindManyMock.mockResolvedValue([])
    await listarPorCliente(10)
    expect(contaFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clienteId: 10 } }),
    )
  })

  it("buscarPorCliente lança 404 quando o cliente não tem conta", async () => {
    contaFindUniqueMock.mockResolvedValue(null)
    await expect(buscarPorCliente(10)).rejects.toBeInstanceOf(AppError)
  })

  it("buscarPorCliente retorna a conta com os cartões", async () => {
    contaFindUniqueMock.mockResolvedValue({ id: 1, clienteId: 10 })
    const conta = await buscarPorCliente(10)
    expect(conta.id).toBe(1)
    expect(contaFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clienteId: 10 } }),
    )
  })

  it("atualizar repassa os dados para o prisma", async () => {
    contaUpdateMock.mockResolvedValue({ id: 1, saldo: 500 })
    await atualizar(1, { saldo: 500 })
    expect(contaUpdateMock).toHaveBeenCalledWith({ where: { id: 1 }, data: { saldo: 500 } })
  })

  it("deletar remove a conta pelo id", async () => {
    contaDeleteMock.mockResolvedValue({ id: 1 })
    await deletar(1)
    expect(contaDeleteMock).toHaveBeenCalledWith({ where: { id: 1 } })
  })
})
