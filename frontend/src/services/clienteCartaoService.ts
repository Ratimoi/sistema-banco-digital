import clienteApi from "./clienteApi"

export const getMeusCartoes = () => clienteApi.get("/cartoes")

export const criarCartao = (data: { tipo: string; limite: number }) => clienteApi.post("/cartoes", data)
