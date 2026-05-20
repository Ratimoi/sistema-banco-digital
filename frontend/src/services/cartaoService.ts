import api from "./api"

export const getCartoes = () => api.get("/cartoes")
export const getCartao = (id: number) => api.get(`/cartoes/${id}`)
export const createCartao = (data: any) => api.post("/cartoes", data)
export const updateCartao = (id: number, data: any) => api.put(`/cartoes/${id}`, data)
export const deleteCartao = (id: number) => api.delete(`/cartoes/${id}`)
