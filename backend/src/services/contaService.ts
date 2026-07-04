import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { cartaoSelect } from "./cartaoService"
import { CreateContaInput, UpdateContaInput } from "../schemas/contaSchema"

export const criar = (data: CreateContaInput) => {
  return prisma.conta.create({ data })
}

export const listar = () => {
  return prisma.conta.findMany({
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { id: "asc" },
  })
}

const ULTIMAS_TRANSACOES = { orderBy: { createdAt: "desc" as const }, take: 50 }

export const buscarPorId = async (id: number) => {
  const conta = await prisma.conta.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nome: true } },
      cartoes: { select: cartaoSelect },
      transacoesEnviadas: ULTIMAS_TRANSACOES,
      transacoesRecebidas: ULTIMAS_TRANSACOES,
    },
  })
  if (!conta) throw new AppError("Conta não encontrada", 404)
  return conta
}

export const listarPorCliente = (clienteId: number) => {
  return prisma.conta.findMany({
    where: { clienteId },
    include: { transacoesEnviadas: ULTIMAS_TRANSACOES, transacoesRecebidas: ULTIMAS_TRANSACOES },
    orderBy: { id: "asc" },
  })
}

export const buscarPorCliente = async (clienteId: number) => {
  const conta = await prisma.conta.findUnique({
    where: { clienteId },
    include: { cartoes: { select: cartaoSelect } },
  })
  if (!conta) throw new AppError("Conta não encontrada", 404)
  return conta
}

export const atualizar = (id: number, data: UpdateContaInput) => {
  return prisma.conta.update({ where: { id }, data })
}

export const deletar = (id: number) => {
  return prisma.conta.delete({ where: { id } })
}
