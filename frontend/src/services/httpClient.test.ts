import { describe, it, expect, vi, beforeEach } from "vitest"

const requestUseMock = vi.fn()
const responseUseMock = vi.fn()
const postMock = vi.fn()
// axios.create() devolve uma instância que também é uma função chamável (usada para reenviar a
// requisição original após renovar o token) — o mock precisa imitar isso.
const instanceCallMock = vi.fn(() => Promise.resolve({ data: "reenviado" }))

vi.mock("axios", () => {
  const instance = Object.assign(instanceCallMock, {
    interceptors: {
      request: { use: requestUseMock },
      response: { use: responseUseMock },
    },
  })
  return {
    default: {
      create: vi.fn(() => instance),
      post: (...args: unknown[]) => postMock(...args),
    },
  }
})

const { createApiClient } = await import("./httpClient")

const getResponseErrorHandler = () => responseUseMock.mock.calls[responseUseMock.mock.calls.length - 1]?.[1]

describe("httpClient: renovação automática de token em 401", () => {
  beforeEach(() => {
    localStorage.clear()
    postMock.mockReset()
    instanceCallMock.mockClear()
    requestUseMock.mockClear()
    responseUseMock.mockClear()
    window.history.pushState({}, "", "/admin")
  })

  it("registra interceptors de request e response quando withAuth (padrão)", () => {
    createApiClient("/api/clientes")
    expect(requestUseMock).toHaveBeenCalled()
    expect(responseUseMock).toHaveBeenCalled()
  })

  it("não registra interceptors quando withAuth é false", () => {
    createApiClient("/api/auth", { withAuth: false })
    expect(requestUseMock).not.toHaveBeenCalled()
    expect(responseUseMock).not.toHaveBeenCalled()
  })

  it("em 401, renova o token e reenvia a requisição original", async () => {
    localStorage.setItem("banco_refresh_token", "refresh-valido")
    postMock.mockResolvedValue({ data: { token: "novo-access-token" } })
    createApiClient("/api/clientes")

    const handler = getResponseErrorHandler()
    const originalConfig: { headers: Record<string, string> } = { headers: {} }
    const resultado = await handler({ response: { status: 401 }, config: originalConfig })

    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/refresh"),
      { refreshToken: "refresh-valido" },
    )
    expect(localStorage.getItem("banco_token")).toBe("novo-access-token")
    expect(originalConfig.headers.Authorization).toBe("Bearer novo-access-token")
    expect(instanceCallMock).toHaveBeenCalledWith(originalConfig)
    expect(resultado).toEqual({ data: "reenviado" })
  })

  it("não tenta renovar duas vezes a mesma requisição (marca _retry)", async () => {
    createApiClient("/api/clientes")
    const handler = getResponseErrorHandler()
    const originalConfig = { headers: {}, _retry: true }

    await expect(
      handler({ response: { status: 401 }, config: originalConfig }),
    ).rejects.toBeDefined()

    expect(postMock).not.toHaveBeenCalled()
  })

  it("deduplica renovações concorrentes: duas requisições em 401 ao mesmo tempo geram só 1 chamada de refresh", async () => {
    localStorage.setItem("banco_refresh_token", "refresh-valido")
    postMock.mockResolvedValue({ data: { token: "novo-access-token" } })
    createApiClient("/api/clientes")
    const handler = getResponseErrorHandler()

    const chamada1 = handler({ response: { status: 401 }, config: { headers: {} } })
    const chamada2 = handler({ response: { status: 401 }, config: { headers: {} } })
    await Promise.all([chamada1, chamada2])

    expect(postMock).toHaveBeenCalledTimes(1)
  })

  it("quando o refresh falha, limpa os tokens e redireciona para /login", async () => {
    localStorage.setItem("banco_token", "token-antigo")
    localStorage.setItem("banco_refresh_token", "refresh-invalido")
    postMock.mockRejectedValue(new Error("refresh token inválido"))
    createApiClient("/api/clientes")

    // jsdom não implementa navegação de verdade — substitui `window.location` por um objeto
    // simples só para capturar a atribuição de `href` feita pelo interceptor.
    const originalLocation = window.location
    // @ts-expect-error jsdom location não é totalmente compatível com o tipo Location
    delete window.location
    // @ts-expect-error mock mínimo só com o que o interceptor usa (href e pathname)
    window.location = { href: "", pathname: "/admin" }

    const handler = getResponseErrorHandler()
    await handler({ response: { status: 401 }, config: { headers: {} } }).catch(() => {})

    expect(localStorage.getItem("banco_token")).toBeNull()
    expect(localStorage.getItem("banco_refresh_token")).toBeNull()
    expect(window.location.href).toBe("/login")

    // @ts-expect-error restaura o location real de volta
    window.location = originalLocation
  })

  it("não tenta renovar quando o erro não é 401", async () => {
    createApiClient("/api/clientes")
    const handler = getResponseErrorHandler()

    await expect(
      handler({ response: { status: 500 }, config: { headers: {} } }),
    ).rejects.toBeDefined()

    expect(postMock).not.toHaveBeenCalled()
  })
})
