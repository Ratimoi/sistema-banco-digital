import { prisma } from "../lib/prisma"
import { CreatePostInput } from "../schemas/comunidadeSchema"

export const criar = (clienteId: number, data: CreatePostInput) => {
  return prisma.post.create({
    data: { ...data, clienteId },
    include: { cliente: { select: { id: true, nome: true } } },
  })
}

export const listar = () => {
  return prisma.post.findMany({
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { createdAt: "desc" },
  })
}
