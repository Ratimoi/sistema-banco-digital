import authApi from "./authApi"

const TOKEN_KEY = "banco_token"
const REFRESH_KEY = "banco_refresh_token"
const NIVEL_KEY = "banco_nivel"

export const cadastro = (data: {
  nome: string
  cpf: string
  email: string
  senha: string
  tipoConta: string
}) => authApi.post("/cadastro", data)

export const login = (email: string, senha: string) => authApi.post("/login", { email, senha })

export const esqueciSenha = (email: string) => authApi.post("/esqueci-senha", { email })

export const redefinirSenha = (data: { email: string; codigo: string; novaSenha: string }) =>
  authApi.post("/redefinir-senha", data)

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const setRefreshToken = (refreshToken: string) => localStorage.setItem(REFRESH_KEY, refreshToken)

export const clearRefreshToken = () => localStorage.removeItem(REFRESH_KEY)

export const isAuthenticated = () => Boolean(getToken())

export const getNivel = () => Number(localStorage.getItem(NIVEL_KEY) ?? 0)

export const setNivel = (nivel: number) => localStorage.setItem(NIVEL_KEY, String(nivel))

export const clearNivel = () => localStorage.removeItem(NIVEL_KEY)
