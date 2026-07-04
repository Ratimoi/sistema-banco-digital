import api from "./api"
import { Cartao, Paginated } from "../types"

export interface CartaoInput {
  numero: string
  validade: string
  cvv: string
  tipo: string
  limite: number
  contaId: number
}

export const getCartoes = (page = 1, limit = 20) =>
  api.get<Paginated<Cartao>>("/cartoes", { params: { page, limit } })
export const getCartao = (id: number) => api.get<Cartao>(`/cartoes/${id}`)
export const createCartao = (data: CartaoInput) => api.post("/cartoes", data)
export const updateCartao = (id: number, data: Partial<CartaoInput>) => api.put(`/cartoes/${id}`, data)
export const deleteCartao = (id: number) => api.delete(`/cartoes/${id}`)
