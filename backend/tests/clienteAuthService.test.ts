import { describe, expect, it, vi, beforeEach } from "vitest"
import bcrypt from "bcryptjs"

const clienteFindUniqueMock = vi.fn()
const clienteUpdateMock = vi.fn()
const clienteCreateMock = vi.fn()
const contaFindUniqueMock = vi.fn()
const contaCreateMock = vi.fn()
const logCreateMock = vi.fn()
const enviarEmailRecuperacaoSenhaMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    cliente: {
      findUnique: (...args: unknown[]) => clienteFindUniqueMock(...args),
      update: (...args: unknown[]) => clienteUpdateMock(...args),
    },
    log: {
      create: (...args: unknown[]) => logCreateMock(...args),
    },
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        cliente: { create: clienteCreateMock },
        conta: { findUnique: contaFindUniqueMock, create: contaCreateMock },
      }),
  },
}))

vi.mock("../src/services/emailService", () => ({
  enviarEmailRecuperacaoSenha: (...args: unknown[]) => enviarEmailRecuperacaoSenhaMock(...args),
}))

const { cadastro, login, solicitarRecuperacaoSenha, redefinirSenha } = await import(
  "../src/services/clienteAuthService"
)
const { AppError } = await import("../src/utils/AppError")

const clienteBase = async (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  nome: "Cliente Teste",
  email: "cliente@banco.com",
  senha: await bcrypt.hash("SenhaForte123!", 10),
  nivel: 0,
  tentativasFalhas: 0,
  bloqueadoAte: null,
  ultimoLogin: null,
  resetToken: null,
  resetTokenExpiry: null,
  ...overrides,
})

describe("clienteAuthService.cadastro", () => {
  beforeEach(() => {
    clienteCreateMock.mockReset()
    contaFindUniqueMock.mockReset()
    contaCreateMock.mockReset()
  })

  it("cria cliente e conta atomicamente com numeroConta gerado", async () => {
    clienteCreateMock.mockResolvedValue({
      id: 1,
      nome: "Novo Cliente",
      cpf: "11122233344",
      email: "novo@banco.com",
      createdAt: new Date(),
    })
    contaFindUniqueMock.mockResolvedValue(null)
    contaCreateMock.mockResolvedValue({ id: 1, numeroConta: "123456", saldo: 0, tipo: "corrente", clienteId: 1 })

    const result = await cadastro({
      nome: "Novo Cliente",
      cpf: "11122233344",
      email: "novo@banco.com",
      senha: "SenhaForte123!",
      tipoConta: "corrente",
    })

    expect(clienteCreateMock).toHaveBeenCalled()
    expect(contaCreateMock).toHaveBeenCalled()
    expect(result.cliente.email).toBe("novo@banco.com")
    expect(result.conta.clienteId).toBe(1)
  })

  it("tenta novamente ao gerar numeroConta se houver colisão", async () => {
    clienteCreateMock.mockResolvedValue({ id: 2, nome: "X", email: "x@banco.com" })
    contaFindUniqueMock.mockResolvedValueOnce({ id: 99 }).mockResolvedValueOnce(null)
    contaCreateMock.mockResolvedValue({ id: 2, numeroConta: "654321", saldo: 0, tipo: "corrente", clienteId: 2 })

    await cadastro({
      nome: "X",
      cpf: "22233344455",
      email: "x@banco.com",
      senha: "SenhaForte123!",
      tipoConta: "corrente",
    })

    expect(contaFindUniqueMock).toHaveBeenCalledTimes(2)
  })
})

describe("clienteAuthService.login", () => {
  beforeEach(() => {
    clienteFindUniqueMock.mockReset()
    clienteUpdateMock.mockReset()
    logCreateMock.mockReset()
  })

  it("lança AppError quando o cliente não existe", async () => {
    clienteFindUniqueMock.mockResolvedValue(null)
    await expect(login({ email: "naoexiste@banco.com", senha: "123456" })).rejects.toThrow(AppError)
  })

  it("lança AppError quando o cliente está bloqueado e registra LOGIN_BLOQUEADO", async () => {
    clienteFindUniqueMock.mockResolvedValue(
      await clienteBase({ bloqueadoAte: new Date(Date.now() + 60_000) }),
    )
    await expect(login({ email: "cliente@banco.com", senha: "SenhaForte123!" })).rejects.toMatchObject({
      statusCode: 423,
    })
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "LOGIN_BLOQUEADO" }) }),
    )
  })

  it("registra LOGIN_FALHA quando a senha está incorreta", async () => {
    clienteFindUniqueMock.mockResolvedValue(await clienteBase({ tentativasFalhas: 0 }))
    await expect(login({ email: "cliente@banco.com", senha: "senhaerrada" })).rejects.toThrow(AppError)
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "LOGIN_FALHA" }) }),
    )
  })

  it("bloqueia o cliente após 3 tentativas inválidas e registra LOGIN_FALHA_BLOQUEIO", async () => {
    clienteFindUniqueMock.mockResolvedValue(await clienteBase({ tentativasFalhas: 2 }))
    await expect(login({ email: "cliente@banco.com", senha: "senhaerrada" })).rejects.toMatchObject({
      statusCode: 423,
    })
    const dataAtualizada = clienteUpdateMock.mock.calls[0][0].data
    expect(dataAtualizada.tentativasFalhas).toBe(0)
    expect(dataAtualizada.bloqueadoAte).toBeInstanceOf(Date)
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "LOGIN_FALHA_BLOQUEIO" }) }),
    )
  })

  it("retorna token com nivel e mensagem de primeiro acesso, registrando LOGIN_SUCESSO", async () => {
    clienteFindUniqueMock.mockResolvedValue(await clienteBase({ ultimoLogin: null }))
    const result = await login({ email: "cliente@banco.com", senha: "SenhaForte123!" })
    expect(result.token).toEqual(expect.any(String))
    expect(result.mensagem).toMatch(/primeiro acesso/i)
    expect(result.cliente).toEqual({ id: 1, nome: "Cliente Teste", email: "cliente@banco.com", nivel: 0 })
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "LOGIN_SUCESSO" }) }),
    )
  })
})

describe("clienteAuthService.solicitarRecuperacaoSenha / redefinirSenha", () => {
  beforeEach(() => {
    clienteFindUniqueMock.mockReset()
    clienteUpdateMock.mockReset()
    logCreateMock.mockReset()
    enviarEmailRecuperacaoSenhaMock.mockReset()
  })

  it("envia e-mail de recuperação e registra RECUPERACAO_SOLICITADA quando o cliente existe", async () => {
    clienteFindUniqueMock.mockResolvedValue(await clienteBase())
    const result = await solicitarRecuperacaoSenha({ email: "cliente@banco.com" })
    expect(enviarEmailRecuperacaoSenhaMock).toHaveBeenCalled()
    expect(result.message).toMatch(/código de recuperação/i)
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "RECUPERACAO_SOLICITADA" }) }),
    )
  })

  it("não revela se o cliente não existe", async () => {
    clienteFindUniqueMock.mockResolvedValue(null)
    const result = await solicitarRecuperacaoSenha({ email: "naoexiste@banco.com" })
    expect(enviarEmailRecuperacaoSenhaMock).not.toHaveBeenCalled()
    expect(result.message).toMatch(/código de recuperação/i)
  })

  it("rejeita código de recuperação inválido", async () => {
    clienteFindUniqueMock.mockResolvedValue(
      await clienteBase({ resetToken: "123456", resetTokenExpiry: new Date(Date.now() + 60_000) }),
    )
    await expect(
      redefinirSenha({ email: "cliente@banco.com", codigo: "000000", novaSenha: "NovaSenha123!" }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it("redefine a senha com um código válido e registra SENHA_REDEFINIDA", async () => {
    clienteFindUniqueMock.mockResolvedValue(
      await clienteBase({ resetToken: "123456", resetTokenExpiry: new Date(Date.now() + 60_000) }),
    )
    const result = await redefinirSenha({
      email: "cliente@banco.com",
      codigo: "123456",
      novaSenha: "NovaSenha123!",
    })
    expect(result.message).toMatch(/sucesso/i)
    expect(clienteUpdateMock).toHaveBeenCalled()
    expect(logCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "SENHA_REDEFINIDA" }) }),
    )
  })
})
