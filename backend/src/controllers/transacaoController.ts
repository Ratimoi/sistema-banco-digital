import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as transacaoService from "../services/transacaoService"
import { paginationQuerySchema } from "../schemas/common"

export const listarTransacoes = asyncHandler(async (req: Request, res: Response) => {
  const transacoes = await transacaoService.listar(paginationQuerySchema.parse(req.query))
  return res.json(transacoes)
})

export const buscarTransacao = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await transacaoService.buscarPorId(Number(req.params.id))
  return res.json(transacao)
})

export const deposito = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await transacaoService.deposito(req.body)
  return res.status(201).json(transacao)
})

export const saque = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await transacaoService.saque(req.body)
  return res.status(201).json(transacao)
})

export const transferencia = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await transacaoService.transferencia(req.body)
  return res.status(201).json(transacao)
})
