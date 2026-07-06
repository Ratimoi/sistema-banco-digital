import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as contaService from "../services/contaService"
import { registrarLog } from "../services/logService"
import { paginationQuerySchema } from "../schemas/common"

// Nível 2 gerencia contas (número, tipo, vínculo com o cliente), mas não define nem altera o
// saldo diretamente — isso fica restrito a nível 3. Removendo o campo (em vez de rejeitar a
// requisição), a conta é criada/atualizada normalmente e o saldo cai no padrão do banco (0) na
// criação, ou simplesmente não é alterado na edição.
const semSaldoParaNivelBaixo = <T extends { saldo?: unknown }>(nivel: number | undefined, data: T): T => {
  if ((nivel ?? 0) >= 3) return data
  const resto = { ...data }
  delete resto.saldo
  return resto
}

export const criarConta = asyncHandler(async (req: Request, res: Response) => {
  const conta = await contaService.criar(semSaldoParaNivelBaixo(req.nivel, req.body))
  return res.status(201).json(conta)
})

export const listarContas = asyncHandler(async (req: Request, res: Response) => {
  const contas = await contaService.listar(paginationQuerySchema.parse(req.query))
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
  const conta = await contaService.atualizar(Number(req.params.id), semSaldoParaNivelBaixo(req.nivel, req.body))
  return res.json(conta)
})

export const deletarConta = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  await contaService.deletar(id)
  await registrarLog(req.clienteId ?? null, "CONTA_EXCLUIDA", `Conta #${id} excluída`)
  return res.json({ message: "Conta deletada com sucesso" })
})
