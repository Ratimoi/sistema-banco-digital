import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
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

export const buscarPorId = async (id: number) => {
  const conta = await prisma.conta.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nome: true } },
      cartoes: true,
      transacoesEnviadas: true,
      transacoesRecebidas: true,
    },
  })
  if (!conta) throw new AppError("Conta não encontrada", 404)
  return conta
}

export const listarPorCliente = (clienteId: number) => {
  return prisma.conta.findMany({
    where: { clienteId },
    include: { transacoesEnviadas: true, transacoesRecebidas: true },
    orderBy: { id: "asc" },
  })
}

export const atualizar = (id: number, data: UpdateContaInput) => {
  return prisma.conta.update({ where: { id }, data })
}

export const deletar = (id: number) => {
  return prisma.conta.delete({ where: { id } })
}
