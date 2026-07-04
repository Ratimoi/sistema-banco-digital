import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as clienteCartaoService from "../services/clienteCartaoService"

export const criar = asyncHandler(async (req: Request, res: Response) => {
  const cartao = await clienteCartaoService.criarParaCliente(req.clienteId!, req.body)
  return res.status(201).json(cartao)
})

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const cartoes = await clienteCartaoService.listarPorCliente(req.clienteId!)
  return res.json(cartoes)
})
