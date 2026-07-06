import { describe, it, expect, vi, beforeEach } from "vitest"

const postMock = vi.fn()

vi.mock("./authApi", () => ({
  default: { post: (...args: unknown[]) => postMock(...args) },
}))

import * as authService from "./authService"

describe("authService: armazenamento de token", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("getToken retorna null quando não há token salvo", () => {
    expect(authService.getToken()).toBeNull()
  })

  it("setToken/getToken/clearToken", () => {
    authService.setToken("abc.def.ghi")
    expect(authService.getToken()).toBe("abc.def.ghi")
    authService.clearToken()
    expect(authService.getToken()).toBeNull()
  })

  it("setRefreshToken/clearRefreshToken usa uma chave separada do access token", () => {
    authService.setToken("access-token")
    authService.setRefreshToken("refresh-token")
    expect(localStorage.getItem("banco_token")).toBe("access-token")
    expect(localStorage.getItem("banco_refresh_token")).toBe("refresh-token")

    authService.clearRefreshToken()
    expect(localStorage.getItem("banco_refresh_token")).toBeNull()
    expect(localStorage.getItem("banco_token")).toBe("access-token")
  })

  it("isAuthenticated reflete a presença do access token", () => {
    expect(authService.isAuthenticated()).toBe(false)
    authService.setToken("abc")
    expect(authService.isAuthenticated()).toBe(true)
  })

  it("getNivel usa 0 como padrão quando não há nível salvo", () => {
    expect(authService.getNivel()).toBe(0)
    authService.setNivel(3)
    expect(authService.getNivel()).toBe(3)
    authService.clearNivel()
    expect(authService.getNivel()).toBe(0)
  })
})

describe("authService: chamadas à API", () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it("login envia email e senha para /login", async () => {
    postMock.mockResolvedValue({ data: {} })
    await authService.login("cliente@banco.com", "SenhaForte123!")
    expect(postMock).toHaveBeenCalledWith("/login", { email: "cliente@banco.com", senha: "SenhaForte123!" })
  })

  it("cadastro envia todos os dados para /cadastro", async () => {
    postMock.mockResolvedValue({ data: {} })
    const dados = {
      nome: "Teste",
      cpf: "11122233344",
      email: "teste@banco.com",
      senha: "SenhaForte123!",
      tipoConta: "corrente",
    }
    await authService.cadastro(dados)
    expect(postMock).toHaveBeenCalledWith("/cadastro", dados)
  })
})
