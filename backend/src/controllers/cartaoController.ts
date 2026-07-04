import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as cartaoService from "../services/cartaoService"
import { paginationQuerySchema } from "../schemas/common"

export const criarCartao = asyncHandler(async (req: Request, res: Response) => {
  const cartao = await cartaoService.criar(req.body)
  return res.status(201).json(cartao)
})

export const listarCartoes = asyncHandler(async (req: Request, res: Response) => {
  const cartoes = await cartaoService.listar(paginationQuerySchema.parse(req.query))
  return res.json(cartoes)
})

export const buscarCartao = asyncHandler(async (req: Request, res: Response) => {
  const cartao = await cartaoService.buscarPorId(Number(req.params.id))
  return res.json(cartao)
})

export const atualizarCartao = asyncHandler(async (req: Request, res: Response) => {
  const cartao = await cartaoService.atualizar(Number(req.params.id), req.body)
  return res.json(cartao)
})

export const deletarCartao = asyncHandler(async (req: Request, res: Response) => {
  await cartaoService.deletar(Number(req.params.id))
  return res.json({ message: "Cartão deletado com sucesso" })
})
