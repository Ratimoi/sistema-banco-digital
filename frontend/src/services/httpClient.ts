/// <reference types="vite/client" />
import axios from "axios"

const TOKEN_KEY = "banco_token"
const REFRESH_KEY = "banco_refresh_token"

// O access token agora dura só 1h (antes eram 8h) — refresh silencioso evita deslogar o usuário
// no meio do uso. Uma única chamada de refresh é compartilhada entre requisições simultâneas que
// caírem em 401 ao mesmo tempo, em vez de cada uma tentar renovar por conta própria.
let refreshEmAndamento: Promise<string> | null = null

const renovarAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) throw new Error("Sem refresh token")

  if (!refreshEmAndamento) {
    const apiOrigin = import.meta.env.VITE_API_URL ?? ""
    refreshEmAndamento = axios
      .post(`${apiOrigin}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem(TOKEN_KEY, data.token)
        return data.token as string
      })
      .finally(() => {
        refreshEmAndamento = null
      })
  }
  return refreshEmAndamento
}

export const createApiClient = (path: string, { withAuth = true }: { withAuth?: boolean } = {}) => {
  const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${path}` : path
  const instance = axios.create({ baseURL })

  if (withAuth) {
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config
        const isLoginPage = window.location.pathname === "/login"
        const jaTentouRenovar = original?._retry

        if (error.response?.status === 401 && !isLoginPage && !jaTentouRenovar && original) {
          original._retry = true
          try {
            const novoToken = await renovarAccessToken()
            original.headers = original.headers ?? {}
            original.headers.Authorization = `Bearer ${novoToken}`
            return instance(original)
          } catch {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_KEY)
            window.location.href = "/login"
          }
        }

        return Promise.reject(error)
      },
    )
  }

  return instance
}
