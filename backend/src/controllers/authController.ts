import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as authService from "../services/authService"

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)
  return res.json(result)
})

export const esqueciSenha = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.solicitarRecuperacaoSenha(req.body)
  return res.json(result)
})

export const redefinirSenha = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.redefinirSenha(req.body)
  return res.json(result)
})
