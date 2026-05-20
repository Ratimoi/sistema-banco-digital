import api from "./api"

export const getContas = () => api.get("/contas")
export const getConta = (id: number) => api.get(`/contas/${id}`)
export const getContasPorCliente = (clienteId: number) => api.get(`/contas/cliente/${clienteId}`)
export const createConta = (data: any) => api.post("/contas", data)
export const updateConta = (id: number, data: any) => api.put(`/contas/${id}`, data)
export const deleteConta = (id: number) => api.delete(`/contas/${id}`)
