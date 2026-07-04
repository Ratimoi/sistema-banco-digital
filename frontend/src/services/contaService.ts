import api from "./api"
import { Conta, Paginated } from "../types"

export interface ContaInput {
  numeroConta: string
  tipo: string
  saldo: number
  clienteId: number
}

export const getContas = (page = 1, limit = 20) =>
  api.get<Paginated<Conta>>("/contas", { params: { page, limit } })
export const getConta = (id: number) => api.get<Conta>(`/contas/${id}`)
export const getContasPorCliente = (clienteId: number) => api.get<Conta[]>(`/contas/cliente/${clienteId}`)
export const createConta = (data: ContaInput) => api.post("/contas", data)
export const updateConta = (id: number, data: Partial<ContaInput>) => api.put(`/contas/${id}`, data)
export const deleteConta = (id: number) => api.delete(`/contas/${id}`)
