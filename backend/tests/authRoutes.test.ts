import express from "express"
import request from "supertest"
import { describe, expect, it, vi, beforeEach } from "vitest"

const loginMock = vi.fn()

vi.mock("../src/services/authService", () => ({
  login: (...args: unknown[]) => loginMock(...args),
}))

const { default: authRoutes } = await import("../src/routes/authRoutes")
const { errorHandler } = await import("../src/middlewares/errorHandler")
const { AppError } = await import("../src/utils/AppError")

const app = express()
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use(errorHandler)

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it("retorna 400 quando o payload é inválido", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "não é um e-mail" })
    expect(res.status).toBe(400)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it("retorna 401 quando o serviço rejeita as credenciais", async () => {
    loginMock.mockRejectedValue(new AppError("E-mail ou senha inválidos", 401))
    const res = await request(app).post("/api/auth/login").send({ email: "admin@banco.com", senha: "errada" })
    expect(res.status).toBe(401)
  })

  it("retorna 200 com o token quando as credenciais são válidas", async () => {
    loginMock.mockResolvedValue({
      token: "abc.def.ghi",
      usuario: { id: 1, nome: "Admin", email: "admin@banco.com" },
    })
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@banco.com", senha: "correta" })
    expect(res.status).toBe(200)
    expect(res.body.token).toBe("abc.def.ghi")
  })
})
