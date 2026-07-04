import { prisma } from "../lib/prisma"

export const registrarLog = (clienteId: number | null, acao: string, detalhe?: string) => {
  return prisma.log.create({
    data: { clienteId, acao, detalhe },
  })
}

export const listarLogs = () => {
  return prisma.log.findMany({
    include: { cliente: { select: { id: true, nome: true, email: true } } },
    orderBy: { id: "desc" },
  })
}
