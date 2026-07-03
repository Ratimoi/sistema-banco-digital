import { describe, expect, it, vi, beforeEach } from "vitest"
import bcrypt from "bcryptjs"

const findUniqueMock = vi.fn()
const updateMock = vi.fn()
const logCreateMock = vi.fn()
const enviarEmailRecuperacaoSenhaMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
    log: {
      create: (...args: unknown[]) => logCreateMock(...args),
    },
  },
}))

vi.mock("../src/services/emailService", () => ({
  enviarEmailRecuperacaoSenha: (...args: unknown[]) => enviarEmailRecuperacaoSenhaMock(...args),
}))

const { login, solicitarRecuperacaoSenha, redefinirSenha } = await import("../src/services/authService")
const { AppError } = await import("../src/utils/AppError")

const usuarioBase = async (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  nome: "Admin",
  email: "admin@banco.com",
  senha: await bcrypt.hash("senhaCerta123!", 10),
  nivel: 1,
  tentativasFalhas: 0,
  bloqueadoAte: null,
  ultimoLogin: null,
  resetToken: null,
  resetTokenExpiry: null,
  ...overrides,
})

describe("authService.login", () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    updateMock.mockReset()
    logCreateMock.mockReset()
  })

  it("lança AppError quando o usuário não existe", async () => {
    findUniqueMock.mockResolvedValue(null)
    await expect(login({ email: "naoexiste@banco.com", senha: "123456" })).rejects.toThrow(AppError)
  })

  it("lança AppError quando o usuário está bloqueado", async () => {
    findUniqueMock.mockResolvedValue(await usuarioBase({ bloqueadoAte: new Date(Date.now() + 60_000) }))
    await expect(login({ email: "admin@banco.com", senha: "senhaCerta123!" })).rejects.toMatchObject({
      statusCode: 423,
    })
  })

  it("lança AppError quando a senha está incorreta e incrementa tentativas", async () => {
    findUniqueMock.mockResolvedValue(await usuarioBase({ tentativasFalhas: 0 }))
    await expect(login({ email: "admin@banco.com", senha: "senhaerrada" })).rejects.toThrow(AppError)
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { tentativasFalhas: 1, bloqueadoAte: null },
    })
  })

  it("bloqueia o usuário após 3 tentativas inválidas", async () => {
    findUniqueMock.mockResolvedValue(await usuarioBase({ tentativasFalhas: 2 }))
    await expect(login({ email: "admin@banco.com", senha: "senhaerrada" })).rejects.toMatchObject({
      statusCode: 423,
    })
    const dataAtualizada = updateMock.mock.calls[0][0].data
    expect(dataAtualizada.tentativasFalhas).toBe(0)
    expect(dataAtualizada.bloqueadoAte).toBeInstanceOf(Date)
  })

  it("retorna token e mensagem de primeiro acesso quando ultimoLogin é nulo", async () => {
    findUniqueMock.mockResolvedValue(await usuarioBase({ ultimoLogin: null }))
    const result = await login({ email: "admin@banco.com", senha: "senhaCerta123!" })
    expect(result.token).toEqual(expect.any(String))
    expect(result.mensagem).toMatch(/primeiro acesso/i)
    expect(result.usuario).toEqual({ id: 1, nome: "Admin", email: "admin@banco.com", nivel: 1 })
  })

  it("retorna mensagem com data do ultimo login quando ja existe um acesso anterior", async () => {
    const dataAnterior = new Date("2026-01-01T10:00:00Z")
    findUniqueMock.mockResolvedValue(await usuarioBase({ ultimoLogin: dataAnterior }))
    const result = await login({ email: "admin@banco.com", senha: "senhaCerta123!" })
    expect(result.mensagem).toMatch(/último acesso/i)
  })
})

describe("authService.solicitarRecuperacaoSenha / redefinirSenha", () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    updateMock.mockReset()
    logCreateMock.mockReset()
    enviarEmailRecuperacaoSenhaMock.mockReset()
  })

  it("envia e-mail de recuperação quando o usuário existe", async () => {
    findUniqueMock.mockResolvedValue(await usuarioBase())
    const result = await solicitarRecuperacaoSenha({ email: "admin@banco.com" })
    expect(enviarEmailRecuperacaoSenhaMock).toHaveBeenCalled()
    expect(result.message).toMatch(/código de recuperação/i)
  })

  it("não envia e-mail nem revela se o usuário não existe", async () => {
    findUniqueMock.mockResolvedValue(null)
    const result = await solicitarRecuperacaoSenha({ email: "naoexiste@banco.com" })
    expect(enviarEmailRecuperacaoSenhaMock).not.toHaveBeenCalled()
    expect(result.message).toMatch(/código de recuperação/i)
  })

  it("rejeita código de recuperação inválido", async () => {
    findUniqueMock.mockResolvedValue(
      await usuarioBase({ resetToken: "123456", resetTokenExpiry: new Date(Date.now() + 60_000) }),
    )
    await expect(
      redefinirSenha({ email: "admin@banco.com", codigo: "000000", novaSenha: "NovaSenha123!" }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it("rejeita código de recuperação expirado", async () => {
    findUniqueMock.mockResolvedValue(
      await usuarioBase({ resetToken: "123456", resetTokenExpiry: new Date(Date.now() - 60_000) }),
    )
    await expect(
      redefinirSenha({ email: "admin@banco.com", codigo: "123456", novaSenha: "NovaSenha123!" }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it("redefine a senha com um código válido", async () => {
    findUniqueMock.mockResolvedValue(
      await usuarioBase({ resetToken: "123456", resetTokenExpiry: new Date(Date.now() + 60_000) }),
    )
    const result = await redefinirSenha({
      email: "admin@banco.com",
      codigo: "123456",
      novaSenha: "NovaSenha123!",
    })
    expect(result.message).toMatch(/sucesso/i)
    expect(updateMock).toHaveBeenCalled()
  })
})
