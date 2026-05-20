import api from "./api"

export const getClientes = () => api.get("/clientes")
export const getCliente = (id: number) => api.get(`/clientes/${id}`)
export const createCliente = (data: any) => api.post("/clientes", data)
export const updateCliente = (id: number, data: any) => api.put(`/clientes/${id}`, data)
export const deleteCliente = (id: number) => api.delete(`/clientes/${id}`)
export const enviarEmail = (id: number) => api.get(`/clientes/${id}/email`)
