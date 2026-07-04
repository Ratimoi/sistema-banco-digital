import clienteAuthApi from "./clienteAuthApi"

const TOKEN_KEY = "banco_cliente_token"

export const cadastro = (data: {
  nome: string
  cpf: string
  email: string
  senha: string
  tipoConta: string
}) => clienteAuthApi.post("/cadastro", data)

export const login = (email: string, senha: string) => clienteAuthApi.post("/login", { email, senha })

export const esqueciSenha = (email: string) => clienteAuthApi.post("/esqueci-senha", { email })

export const redefinirSenha = (data: { email: string; codigo: string; novaSenha: string }) =>
  clienteAuthApi.post("/redefinir-senha", data)

export const getClienteToken = () => localStorage.getItem(TOKEN_KEY)

export const setClienteToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

export const clearClienteToken = () => localStorage.removeItem(TOKEN_KEY)

export const isClienteAuthenticated = () => Boolean(getClienteToken())
