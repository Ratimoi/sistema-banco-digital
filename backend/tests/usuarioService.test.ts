import { describe, expect, it, vi, beforeEach } from "vitest"

const findUniqueMock = vi.fn()
const createMock = vi.fn()
const logCreateMock = vi.fn()

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
    log: {
      create: (...args: unknown[]) => logCreateMock(...args),
    },
  },
}))

const { criar } = await import("../src/services/usuarioService")

describe("usuarioService.criar", () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    createMock.mockReset()
    logCreateMock.mockReset()
  })

  it("rejeita quando já existe um usuário com o mesmo e-mail", async () => {
    findUniqueMock.mockResolvedValue({ id: 1, email: "admin@banco.com" })
    await expect(
      criar({ nome: "Admin", email: "admin@banco.com", senha: "SenhaForte123!", nivel: 1 }),
    ).rejects.toMatchObject({ statusCode: 409 })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("cria o usuário e registra log quando o e-mail é único", async () => {
    findUniqueMock.mockResolvedValue(null)
    createMock.mockResolvedValue({ id: 1, nome: "Admin", email: "admin@banco.com", nivel: 1 })

    const usuario = await criar({
      nome: "Admin",
      email: "admin@banco.com",
      senha: "SenhaForte123!",
      nivel: 1,
    })

    expect(usuario.email).toBe("admin@banco.com")
    expect(logCreateMock).toHaveBeenCalled()
  })
})
