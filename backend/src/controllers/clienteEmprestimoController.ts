import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as clienteEmprestimoService from "../services/clienteEmprestimoService"

export const solicitar = asyncHandler(async (req: Request, res: Response) => {
  const emprestimo = await clienteEmprestimoService.solicitar({
    clienteId: req.clienteId!,
    ...req.body,
  })
  return res.status(201).json(emprestimo)
})

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const emprestimos = await clienteEmprestimoService.listarPorCliente(req.clienteId!)
  return res.json(emprestimos)
})
