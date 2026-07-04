import clienteApi from "./clienteApi"

export const getMinhasTransacoes = () => clienteApi.get("/transacoes")

export const saque = (data: { cartaoNumero: string; valor: number }) =>
  clienteApi.post("/transacoes/saque", data)

export const transferencia = (data: { cartaoNumeroDestino: string; valor: number }) =>
  clienteApi.post("/transacoes/transferencia", data)
