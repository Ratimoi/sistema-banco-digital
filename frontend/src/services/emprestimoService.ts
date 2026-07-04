import api from "./api"
import { Emprestimo, Paginated } from "../types"

export interface EmprestimoInput {
  valor: number
  taxaJuros: number
  parcelas: number
  status: string
  clienteId: number
}

export const getEmprestimos = (page = 1, limit = 20) =>
  api.get<Paginated<Emprestimo>>("/emprestimos", { params: { page, limit } })
export const getEmprestimo = (id: number) => api.get<Emprestimo>(`/emprestimos/${id}`)
export const createEmprestimo = (data: EmprestimoInput) => api.post("/emprestimos", data)
export const updateEmprestimo = (id: number, data: Partial<EmprestimoInput>) =>
  api.put(`/emprestimos/${id}`, data)
export const deleteEmprestimo = (id: number) => api.delete(`/emprestimos/${id}`)
export const aprovarEmprestimo = (id: number) => api.post(`/emprestimos/${id}/aprovar`)
export const rejeitarEmprestimo = (id: number) => api.post(`/emprestimos/${id}/rejeitar`)
