import { describe, expect, it, vi } from "vitest"
import { requireNivel } from "../src/middlewares/nivel"

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

describe("requireNivel", () => {
  it("bloqueia com 403 quando o nivel do usuario é insuficiente", () => {
    const req = { usuarioNivel: 1 } as never
    const res = mockRes()
    const next = vi.fn()

    requireNivel(3)(req, res as never, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
  })

  it("permite seguir quando o nivel do usuario é suficiente", () => {
    const req = { usuarioNivel: 3 } as never
    const res = mockRes()
    const next = vi.fn()

    requireNivel(3)(req, res as never, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.statusCode).toBeUndefined()
  })
})
