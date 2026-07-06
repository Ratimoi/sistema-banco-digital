import { describe, expect, it, vi, beforeEach } from "vitest"

const contaFindUniqueMock = vi.fn()
const cartaoCreateMock = vi.fn()
const cartaoFindUniqueMock = vi.fn()
const cartaoFindManyMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    conta: { findUnique: (...args: unknown[]) => contaFindUniqueMock(...args) },
    cartao: {
      create: (...args: unknown[]) => cartaoCreateMock(...args),
      findUnique: (...args: unknown[]) => cartaoFindUniqueMock(...args),
      findMany: (...args: unknown[]) => cartaoFindManyMock(...args),
    },
  },
}))

const { criarParaCliente, listarPorCliente } = await import("../src/services/clienteCartaoService")
const { AppError } = await import("../src/utils/AppError")

describe("clienteCartaoService.criarParaCliente", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    cartaoCreateMock.mockReset()
    cartaoFindUniqueMock.mockReset()
  })

  it("lança 404 quando o cliente não tem conta", async () => {
    contaFindUniqueMock.mockResolvedValue(null)
    await expect(criarParaCliente(10, { tipo: "debito", limite: 0 })).rejects.toMatchObject({
      statusCode: 404,
    })
    expect(cartaoCreateMock).not.toHaveBeenCalled()
  })

  it("gera número, validade e cvv, e cria o cartão vinculado à conta do cliente", async () => {
    contaFindUniqueMock.mockResolvedValue({ id: 5, clienteId: 10 })
    cartaoFindUniqueMock.mockResolvedValue(null)
    cartaoCreateMock.mockResolvedValue({ id: 1, contaId: 5 })

    await criarParaCliente(10, { tipo: "credito", limite: 1000 })

    expect(cartaoCreateMock).toHaveBeenCalledTimes(1)
    const dadosCriados = cartaoCreateMock.mock.calls[0][0].data
    expect(dadosCriados.contaId).toBe(5)
    expect(dadosCriados.tipo).toBe("credito")
    expect(dadosCriados.numero).toMatch(/^\d{4}-\d{4}-\d{4}-\d{4}$/)
    expect(dadosCriados.validade).toMatch(/^\d{2}\/\d{2}$/)
    expect(dadosCriados.cvv).toMatch(/^\d{3}$/)
  })

  it("gera outro número quando há colisão", async () => {
    contaFindUniqueMock.mockResolvedValue({ id: 5, clienteId: 10 })
    cartaoFindUniqueMock.mockResolvedValueOnce({ id: 99 }).mockResolvedValueOnce(null)
    cartaoCreateMock.mockResolvedValue({ id: 1, contaId: 5 })

    await criarParaCliente(10, { tipo: "debito", limite: 0 })

    expect(cartaoFindUniqueMock).toHaveBeenCalledTimes(2)
  })
})

describe("clienteCartaoService.listarPorCliente", () => {
  beforeEach(() => {
    contaFindUniqueMock.mockReset()
    cartaoFindManyMock.mockReset()
  })

  it("lança 404 quando o cliente não tem conta", async () => {
    contaFindUniqueMock.mockResolvedValue(null)
    await expect(listarPorCliente(10)).rejects.toBeInstanceOf(AppError)
  })

  it("lista os cartões da conta do cliente", async () => {
    contaFindUniqueMock.mockResolvedValue({ id: 5, clienteId: 10 })
    cartaoFindManyMock.mockResolvedValue([{ id: 1, contaId: 5 }])

    const cartoes = await listarPorCliente(10)

    expect(cartoes).toHaveLength(1)
    expect(cartaoFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { contaId: 5 } }),
    )
  })
})
