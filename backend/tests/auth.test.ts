import { describe, expect, it, vi } from "vitest"
import jwt from "jsonwebtoken"
import { auth } from "../src/middlewares/auth"
import { env } from "../src/config/env"

const mockRes = () => {
  const res: {
    statusCode?: number
    body?: unknown
    status: (c: number) => typeof res
    json: (b: unknown) => void
  } = {
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
    },
  }
  return res
}

describe("auth", () => {
  it("bloqueia com 401 quando não há header Authorization", () => {
    const req = { headers: {} } as never
    const res = mockRes()
    const next = vi.fn()

    auth(req, res as never, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
  })

  it("bloqueia com 401 quando o token é inválido", () => {
    const req = { headers: { authorization: "Bearer token.invalido" } } as never
    const res = mockRes()
    const next = vi.fn()

    auth(req, res as never, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
  })

  it("permite seguir com um access token válido", () => {
    const token = jwt.sign({ sub: 1, nivel: 2, tipo: "acesso" }, env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } } as never
    const res = mockRes()
    const next = vi.fn()

    auth(req, res as never, next)

    expect(next).toHaveBeenCalledOnce()
    expect((req as { clienteId?: number }).clienteId).toBe(1)
    expect((req as { nivel?: number }).nivel).toBe(2)
  })

  it("permite seguir com um token antigo sem claim `tipo` (compatibilidade)", () => {
    const token = jwt.sign({ sub: 1, nivel: 0 }, env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } } as never
    const res = mockRes()
    const next = vi.fn()

    auth(req, res as never, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it("bloqueia com 401 quando o token é um refresh token", () => {
    const token = jwt.sign({ sub: 1, nivel: 0, tipo: "refresh" }, env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } } as never
    const res = mockRes()
    const next = vi.fn()

    auth(req, res as never, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
  })
})
