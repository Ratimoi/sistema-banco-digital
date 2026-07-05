import api from "./api"
import { Post } from "../types"

export const getPosts = () => api.get<Post[]>("/comunidade")

export const criarPost = (conteudo: string) => api.post("/comunidade", { conteudo })
