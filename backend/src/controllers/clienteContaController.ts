import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as contaService from "../services/contaService"

export const minhaConta = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.buscarPorCliente(req.clienteId!)
  return res.json(conta)
})
