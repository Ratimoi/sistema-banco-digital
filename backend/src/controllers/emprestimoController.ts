import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as emprestimoService from "../services/emprestimoService"

export const criarEmprestimo = asyncHandler(async (req: Request, res: Response) => {
  const emprestimo = await emprestimoService.criar(req.body)
  return res.status(201).json(emprestimo)
})

export const listarEmprestimos = asyncHandler(async (req: Request, res: Response) => {
  const emprestimos = await emprestimoService.listar()
  return res.json(emprestimos)
})

export const buscarEmprestimo = asyncHandler(async (req: Request, res: Response) => {
  const emprestimo = await emprestimoService.buscarPorId(Number(req.params.id))
  return res.json(emprestimo)
})

export const atualizarEmprestimo = asyncHandler(async (req: Request, res: Response) => {
  const emprestimo = await emprestimoService.atualizar(Number(req.params.id), req.body)
  return res.json(emprestimo)
})

export const deletarEmprestimo = asyncHandler(async (req: Request, res: Response) => {
  await emprestimoService.deletar(Number(req.params.id))
  return res.json({ message: "Empréstimo deletado com sucesso" })
})
