import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as clienteTransacaoService from "../services/clienteTransacaoService"
import * as transacaoService from "../services/transacaoService"
import * as contaService from "../services/contaService"

export const saque = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await clienteTransacaoService.saquePorCartao({
    clienteId: req.clienteId!,
    ...req.body,
  })
  return res.status(201).json(transacao)
})

export const transferencia = asyncHandler(async (req: Request, res: Response) => {
  const transacao = await clienteTransacaoService.transferenciaPorCartao({
    clienteId: req.clienteId!,
    ...req.body,
  })
  return res.status(201).json(transacao)
})

export const minhasTransacoes = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.buscarPorCliente(req.clienteId!)
  const transacoes = await transacaoService.listarPorConta(conta.id)
  return res.json(transacoes)
})
