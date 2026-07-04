/// <reference types="vite/client" />
import axios from "axios"

export const createApiClient = (path: string, { withAuth = true }: { withAuth?: boolean } = {}) => {
  const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${path}` : path
  const instance = axios.create({ baseURL })

  if (withAuth) {
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("banco_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && window.location.pathname !== "/login") {
          localStorage.removeItem("banco_token")
          window.location.href = "/login"
        }
        return Promise.reject(error)
      },
    )
  }

  return instance
}
