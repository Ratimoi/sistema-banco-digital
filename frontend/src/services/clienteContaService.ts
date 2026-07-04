import clienteApi from "./clienteApi"

export const getMinhaConta = () => clienteApi.get("/minha-conta")
