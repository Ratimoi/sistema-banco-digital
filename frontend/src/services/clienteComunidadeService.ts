import clienteApi from "./clienteApi"
import { Post } from "../types"

export const getPosts = () => clienteApi.get<Post[]>("/comunidade")

export const criarPost = (conteudo: string, midia?: { url: string; tipo: string }) =>
  clienteApi.post("/comunidade", { conteudo, midiaUrl: midia?.url, midiaTipo: midia?.tipo })

export const uploadMidia = (arquivo: File) => {
  const formData = new FormData()
  formData.append("arquivo", arquivo)
  return clienteApi.post<{ url: string; tipo: string }>("/comunidade/upload", formData)
}
