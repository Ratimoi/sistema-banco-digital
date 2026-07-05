import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as comunidadeService from "../services/comunidadeService"
import * as uploadService from "../services/uploadService"
import { AppError } from "../utils/AppError"

export const criarPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await comunidadeService.criar(req.clienteId!, req.body)
  return res.status(201).json(post)
})

export const listarPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await comunidadeService.listar()
  return res.json(posts)
})

export const deletarPost = asyncHandler(async (req: Request, res: Response) => {
  await comunidadeService.deletar(Number(req.params.id))
  return res.json({ message: "Publicação deletada com sucesso" })
})

export const uploadMidia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("Nenhum arquivo enviado", 400)
  const resultado = await uploadService.enviarMidia(req.file)
  return res.status(201).json(resultado)
})
