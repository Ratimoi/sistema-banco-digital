import clienteApi from "./clienteApi"

export const getPosts = () => clienteApi.get("/comunidade")

export const criarPost = (conteudo: string) => clienteApi.post("/comunidade", { conteudo })
