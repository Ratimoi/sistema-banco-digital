import { prisma } from "../lib/prisma"

export const registrarLog = (usuarioId: number | null, acao: string, detalhe?: string) => {
  return prisma.log.create({
    data: { usuarioId, acao, detalhe },
  })
}

export const listarLogs = () => {
  return prisma.log.findMany({
    include: { usuario: { select: { id: true, nome: true, email: true } } },
    orderBy: { id: "desc" },
  })
}
