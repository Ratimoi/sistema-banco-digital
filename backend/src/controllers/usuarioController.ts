import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as usuarioService from "../services/usuarioService"

export const criarUsuario = asyncHandler(async (req: Request, res: Response) => {
  const usuario = await usuarioService.criar(req.body)
  return res.status(201).json(usuario)
})

export const listarUsuarios = asyncHandler(async (req: Request, res: Response) => {
  const usuarios = await usuarioService.listar()
  return res.json(usuarios)
})
