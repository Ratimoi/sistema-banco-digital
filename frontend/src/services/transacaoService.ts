import api from "./api"
import { Transacao, Paginated } from "../types"

export interface DepositoInput {
  contaId: number
  valor: number
}

export interface SaqueInput {
  contaId: number
  valor: number
}

export interface TransferenciaInput {
  origemId: number
  destinoId: number
  valor: number
}

export const getTransacoes = (page = 1, limit = 20) =>
  api.get<Paginated<Transacao>>("/transacoes", { params: { page, limit } })
export const getTransacao = (id: number) => api.get<Transacao>(`/transacoes/${id}`)
export const deposito = (data: DepositoInput) => api.post("/transacoes/deposito", data)
export const saque = (data: SaqueInput) => api.post("/transacoes/saque", data)
export const transferencia = (data: TransferenciaInput) => api.post("/transacoes/transferencia", data)
