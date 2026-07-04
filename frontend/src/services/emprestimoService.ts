import api from "./api"

export const getEmprestimos = () => api.get("/emprestimos")
export const getEmprestimo = (id: number) => api.get(`/emprestimos/${id}`)
export const createEmprestimo = (data: any) => api.post("/emprestimos", data)
export const updateEmprestimo = (id: number, data: any) => api.put(`/emprestimos/${id}`, data)
export const deleteEmprestimo = (id: number) => api.delete(`/emprestimos/${id}`)
export const aprovarEmprestimo = (id: number) => api.post(`/emprestimos/${id}/aprovar`)
export const rejeitarEmprestimo = (id: number) => api.post(`/emprestimos/${id}/rejeitar`)
