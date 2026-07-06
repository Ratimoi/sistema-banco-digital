import { prisma } from "../lib/prisma"
import { PaginationQuery } from "../schemas/common"
import { paginar } from "../utils/paginate"

export const registrarLog = (clienteId: number | null, acao: string, detalhe?: string) => {
  return prisma.log.create({
    data: { clienteId, acao, detalhe },
  })
}

export const listarLogs = (paginacao: PaginationQuery) => {
  return paginar(
    () => prisma.log.count(),
    (skip, take) =>
      prisma.log.findMany({
        include: { cliente: { select: { id: true, nome: true, email: true } } },
        orderBy: { id: "desc" },
        skip,
        take,
      }),
    paginacao,
  )
}
