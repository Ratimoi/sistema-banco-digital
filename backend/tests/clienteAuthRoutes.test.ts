import express from "express"
import request from "supertest"
import { describe, expect, it, vi, beforeEach } from "vitest"

const cadastroMock = vi.fn()
const loginMock = vi.fn()
const refreshMock = vi.fn()

vi.mock("../src/services/clienteAuthService", () => ({
  cadastro: (...args: unknown[]) => cadastroMock(...args),
  login: (...args: unknown[]) => loginMock(...args),
  solicitarRecuperacaoSenha: vi.fn(),
  redefinirSenha: vi.fn(),
  refresh: (...args: unknown[]) => refreshMock(...args),
}))

const { default: clienteAuthRoutes } = await import("../src/routes/clienteAuthRoutes")
const { errorHandler } = await import("../src/middlewares/errorHandler")
const { AppError } = await import("../src/utils/AppError")

const app = express()
app.use(express.json())
app.use("/api/cliente-auth", clienteAuthRoutes)
app.use(errorHandler)

describe("POST /api/cliente-auth/cadastro", () => {
  beforeEach(() => {
    cadastroMock.mockReset()
  })

  it("retorna 400 quando a senha não é forte o bastante", async () => {
    const res = await request(app).post("/api/cliente-auth/cadastro").send({
      nome: "Teste",
      cpf: "11122233344",
      email: "teste@banco.com",
      senha: "123456",
      tipoConta: "corrente",
    })
    expect(res.status).toBe(400)
    expect(cadastroMock).not.toHaveBeenCalled()
  })

  it("retorna 409 quando o serviço rejeita e-mail duplicado", async () => {
    cadastroMock.mockRejectedValue(new AppError("Já existe um registro com esses dados", 409))
    const res = await request(app).post("/api/cliente-auth/cadastro").send({
      nome: "Teste",
      cpf: "11122233344",
      email: "teste@banco.com",
      senha: "SenhaForte123!",
      tipoConta: "corrente",
    })
    expect(res.status).toBe(409)
  })

  it("retorna 201 com cliente e conta quando o cadastro é válido", async () => {
    cadastroMock.mockResolvedValue({
      cliente: { id: 1, nome: "Teste", email: "teste@banco.com" },
      conta: { id: 1, numeroConta: "123456" },
    })
    const res = await request(app).post("/api/cliente-auth/cadastro").send({
      nome: "Teste",
      cpf: "11122233344",
      email: "teste@banco.com",
      senha: "SenhaForte123!",
      tipoConta: "corrente",
    })
    expect(res.status).toBe(201)
    expect(res.body.conta.numeroConta).toBe("123456")
  })
})

describe("POST /api/cliente-auth/login", () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it("retorna 401 quando as credenciais são inválidas", async () => {
    loginMock.mockRejectedValue(new AppError("E-mail ou senha inválidos", 401))
    const res = await request(app)
      .post("/api/cliente-auth/login")
      .send({ email: "teste@banco.com", senha: "errada" })
    expect(res.status).toBe(401)
  })

  it("retorna 200 com o token quando as credenciais são válidas", async () => {
    loginMock.mockResolvedValue({ token: "abc.def.ghi", cliente: { id: 1, nome: "Teste" } })
    const res = await request(app)
      .post("/api/cliente-auth/login")
      .send({ email: "teste@banco.com", senha: "correta" })
    expect(res.status).toBe(200)
    expect(res.body.token).toBe("abc.def.ghi")
  })
})

describe("POST /api/cliente-auth/refresh", () => {
  beforeEach(() => {
    refreshMock.mockReset()
  })

  it("retorna 400 quando o refreshToken não é enviado", async () => {
    const res = await request(app).post("/api/cliente-auth/refresh").send({})
    expect(res.status).toBe(400)
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it("retorna 401 quando o serviço rejeita o refresh token", async () => {
    refreshMock.mockRejectedValue(new AppError("Refresh token inválido ou expirado", 401))
    const res = await request(app).post("/api/cliente-auth/refresh").send({ refreshToken: "invalido" })
    expect(res.status).toBe(401)
  })

  it("retorna 200 com um novo access token", async () => {
    refreshMock.mockResolvedValue({ token: "novo.access.token" })
    const res = await request(app)
      .post("/api/cliente-auth/refresh")
      .send({ refreshToken: "valido.refresh.token" })
    expect(res.status).toBe(200)
    expect(res.body.token).toBe("novo.access.token")
  })
})
