import { describe, expect, it, vi, beforeEach } from "vitest"
import bcrypt from "bcryptjs"

const findUniqueMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}))

const { login } = await import("../src/services/authService")
const { AppError } = await import("../src/utils/AppError")

describe("authService.login", () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
  })

  it("lança AppError quando o usuário não existe", async () => {
    findUniqueMock.mockResolvedValue(null)
    await expect(login({ email: "naoexiste@banco.com", senha: "123456" })).rejects.toThrow(AppError)
  })

  it("lança AppError quando a senha está incorreta", async () => {
    findUniqueMock.mockResolvedValue({
      id: 1,
      nome: "Admin",
      email: "admin@banco.com",
      senha: await bcrypt.hash("senhacerta", 10),
    })
    await expect(login({ email: "admin@banco.com", senha: "senhaerrada" })).rejects.toThrow(AppError)
  })

  it("retorna um token quando as credenciais estão corretas", async () => {
    findUniqueMock.mockResolvedValue({
      id: 1,
      nome: "Admin",
      email: "admin@banco.com",
      senha: await bcrypt.hash("senhacerta", 10),
    })
    const result = await login({ email: "admin@banco.com", senha: "senhacerta" })
    expect(result.token).toEqual(expect.any(String))
    expect(result.usuario).toEqual({ id: 1, nome: "Admin", email: "admin@banco.com" })
  })
})
