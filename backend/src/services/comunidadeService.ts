import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
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

export const deletar = async (id: number) => {
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) throw new AppError("Publicação não encontrada", 404)
  return prisma.post.delete({ where: { id } })
}
