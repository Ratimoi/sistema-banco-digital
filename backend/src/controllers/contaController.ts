import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as contaService from "../services/contaService"
import { registrarLog } from "../services/logService"

export const criarConta = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.criar(req.body)
  return res.status(201).json(conta)
})

export const listarContas = asyncHandler(async (req: Request, res: Response) => {
  const contas = await contaService.listar()
  return res.json(contas)
})

export const buscarConta = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.buscarPorId(Number(req.params.id))
  return res.json(conta)
})

export const contasPorCliente = asyncHandler(async (req: Request, res: Response) => {
  const contas = await contaService.listarPorCliente(Number(req.params.clienteId))
  return res.json(contas)
})

export const atualizarConta = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.atualizar(Number(req.params.id), req.body)
  return res.json(conta)
})

export const deletarConta = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  await contaService.deletar(id)
  await registrarLog(req.usuarioId ?? null, "CONTA_EXCLUIDA", `Conta #${id} excluída`)
  return res.json({ message: "Conta deletada com sucesso" })
})
