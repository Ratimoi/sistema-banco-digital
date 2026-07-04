import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { AppError } from "../utils/AppError"
import * as clienteService from "../services/clienteService"
import { registrarLog } from "../services/logService"
import { paginationQuerySchema } from "../schemas/common"

export const criarCliente = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.criar(req.body)
  return res.status(201).json(cliente)
})

export const listarClientes = asyncHandler(async (req: Request, res: Response) => {
  const clientes = await clienteService.listar(paginationQuerySchema.parse(req.query))
  return res.json(clientes)
})

export const buscarCliente = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.buscarPorId(Number(req.params.id))
  if (!cliente) throw new AppError("Cliente não encontrado", 404)
  return res.json(cliente)
})

export const atualizarCliente = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.atualizar(Number(req.params.id), req.body)
  return res.json(cliente)
})

export const deletarCliente = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  await clienteService.deletar(id)
  await registrarLog(req.clienteId ?? null, "CLIENTE_EXCLUIDO", `Cliente #${id} excluído`)
  return res.json({ message: "Cliente deletado com sucesso" })
})
