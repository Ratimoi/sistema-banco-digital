/// <reference types="vite/client" />
import axios from "axios"

const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/cliente` : "/api/cliente",
})

clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("banco_cliente_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith("/portal/login")) {
      localStorage.removeItem("banco_cliente_token")
      window.location.href = "/portal/login"
    }
    return Promise.reject(error)
  },
)

export default clienteApi
