import api from "./api"

export const getTransacoes = () => api.get("/transacoes")
export const getTransacao = (id: number) => api.get(`/transacoes/${id}`)
export const deposito = (data: any) => api.post("/transacoes/deposito", data)
export const saque = (data: any) => api.post("/transacoes/saque", data)
export const transferencia = (data: any) => api.post("/transacoes/transferencia", data)
