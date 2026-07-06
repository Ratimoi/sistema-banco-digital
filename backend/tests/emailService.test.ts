import { describe, expect, it, vi, beforeEach } from "vitest"

const sendMock = vi.fn()
const clienteFindUniqueMock = vi.fn()

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } }
  }),
}))

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    cliente: { findUnique: (...args: unknown[]) => clienteFindUniqueMock(...args) },
  },
}))

const { enviarEmailRecuperacaoSenha, enviarEmailRelatorio } = await import("../src/services/emailService")
const { AppError } = await import("../src/utils/AppError")

describe("emailService.enviarEmailRecuperacaoSenha", () => {
  beforeEach(() => {
    sendMock.mockReset()
  })

  it("envia o e-mail com o código de recuperação", async () => {
    sendMock.mockResolvedValue({ error: null })
    await enviarEmailRecuperacaoSenha("cliente@banco.com", "Cliente Teste", "123456")

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "cliente@banco.com",
        text: expect.stringContaining("123456"),
      }),
    )
  })

  it("lança AppError 502 quando o Resend retorna erro", async () => {
    sendMock.mockResolvedValue({ error: { message: "falha no envio" } })
    await expect(
      enviarEmailRecuperacaoSenha("cliente@banco.com", "Cliente Teste", "123456"),
    ).rejects.toMatchObject({ statusCode: 502 })
  })
})

describe("emailService.enviarEmailRelatorio", () => {
  beforeEach(() => {
    sendMock.mockReset()
    clienteFindUniqueMock.mockReset()
  })

  it("lança 404 quando o cliente não existe", async () => {
    clienteFindUniqueMock.mockResolvedValue(null)
    await expect(enviarEmailRelatorio(999)).rejects.toBeInstanceOf(AppError)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it("monta o relatório a partir das transações enviadas e recebidas", async () => {
    clienteFindUniqueMock.mockResolvedValue({
      id: 1,
      nome: "Cliente Teste",
      email: "cliente@banco.com",
      conta: {
        transacoesEnviadas: [{ tipo: "SAQUE", valor: { toFixed: () => "50.00" }, createdAt: new Date() }],
        transacoesRecebidas: [],
      },
    })
    sendMock.mockResolvedValue({ error: null })

    const resultado = await enviarEmailRelatorio(1)

    expect(resultado).toBe(true)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "cliente@banco.com", text: expect.stringContaining("SAQUE") }),
    )
  })

  it("informa que não há transações quando a conta não tem nenhuma", async () => {
    clienteFindUniqueMock.mockResolvedValue({
      id: 1,
      nome: "Cliente Teste",
      email: "cliente@banco.com",
      conta: { transacoesEnviadas: [], transacoesRecebidas: [] },
    })
    sendMock.mockResolvedValue({ error: null })

    await enviarEmailRelatorio(1)

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining("Nenhuma transação encontrada") }),
    )
  })

  it("lança AppError 502 quando o Resend retorna erro", async () => {
    clienteFindUniqueMock.mockResolvedValue({
      id: 1,
      nome: "Cliente Teste",
      email: "cliente@banco.com",
      conta: null,
    })
    sendMock.mockResolvedValue({ error: { message: "falha" } })
    await expect(enviarEmailRelatorio(1)).rejects.toMatchObject({ statusCode: 502 })
  })
})
