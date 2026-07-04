import api from "./api"
import { Cliente, Paginated } from "../types"

export interface ClienteInput {
  nome: string
  cpf: string
  email: string
  senha?: string
  nivel?: number
}

export const getClientes = (page = 1, limit = 20) =>
  api.get<Paginated<Cliente>>("/clientes", { params: { page, limit } })
export const getCliente = (id: number) => api.get<Cliente>(`/clientes/${id}`)
export const createCliente = (data: ClienteInput) => api.post("/clientes", data)
export const updateCliente = (id: number, data: Partial<ClienteInput>) => api.put(`/clientes/${id}`, data)
export const deleteCliente = (id: number) => api.delete(`/clientes/${id}`)
export const enviarEmail = (id: number) => api.get(`/clientes/${id}/email`)
