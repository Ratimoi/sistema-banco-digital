import api from "./api"
import { Post } from "../types"

export const getPosts = () => api.get<Post[]>("/comunidade")

export const criarPost = (conteudo: string, midia?: { url: string; tipo: string }) =>
  api.post("/comunidade", { conteudo, midiaUrl: midia?.url, midiaTipo: midia?.tipo })

export const deletarPost = (id: number) => api.delete(`/comunidade/${id}`)

export const uploadMidia = (arquivo: File) => {
  const formData = new FormData()
  formData.append("arquivo", arquivo)
  return api.post<{ url: string; tipo: string }>("/comunidade/upload", formData)
}
