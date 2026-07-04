import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as clienteAuthService from "../services/clienteAuthService"

export const cadastro = asyncHandler(async (req: Request, res: Response) => {
  const result = await clienteAuthService.cadastro(req.body)
  return res.status(201).json(result)
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await clienteAuthService.login(req.body)
  return res.json(result)
})

export const esqueciSenha = asyncHandler(async (req: Request, res: Response) => {
  const result = await clienteAuthService.solicitarRecuperacaoSenha(req.body)
  return res.json(result)
})

export const redefinirSenha = asyncHandler(async (req: Request, res: Response) => {
  const result = await clienteAuthService.redefinirSenha(req.body)
  return res.json(result)
})
