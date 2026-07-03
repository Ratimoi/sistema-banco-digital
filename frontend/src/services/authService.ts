import api from "./api"

const TOKEN_KEY = "banco_token"

export const login = (email: string, senha: string) =>
  api.post("/auth/login", { email, senha })

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const isAuthenticated = () => Boolean(getToken())
