import clienteApi from "./clienteApi"
import { Post } from "../types"

export const getPosts = () => clienteApi.get<Post[]>("/comunidade")

export const criarPost = (conteudo: string) => clienteApi.post("/comunidade", { conteudo })
