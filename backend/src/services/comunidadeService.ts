import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { CreatePostInput } from "../schemas/comunidadeSchema"
import { removerMidia } from "./uploadService"

const DIAS_RETENCAO = 30

export const criar = (clienteId: number, data: CreatePostInput) => {
  return prisma.post.create({
    data: { ...data, clienteId },
    include: { cliente: { select: { id: true, nome: true } } },
  })
}

// Roda a cada listagem do mural (em vez de um cron) — no plano free do Render o processo pode
// ficar hibernado sem tráfego, então um agendamento por tempo não é confiável; disparar a
// limpeza a cada visita real ao mural garante que ela eventualmente aconteça de qualquer forma.
const limparAntigos = async () => {
  const limite = new Date(Date.now() - DIAS_RETENCAO * 24 * 60 * 60 * 1000)
  const antigos = await prisma.post.findMany({
    where: { createdAt: { lt: limite } },
    select: { id: true, midiaUrl: true },
  })
  if (antigos.length === 0) return

  await Promise.all(
    antigos.filter((p) => p.midiaUrl).map((p) => removerMidia(p.midiaUrl!).catch(() => {})),
  )
  await prisma.post.deleteMany({ where: { id: { in: antigos.map((p) => p.id) } } })
}

export const listar = async () => {
  await limparAntigos().catch(() => {})
  return prisma.post.findMany({
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export const deletar = async (id: number) => {
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) throw new AppError("Publicação não encontrada", 404)
  if (post.midiaUrl) await removerMidia(post.midiaUrl).catch(() => {})
  return prisma.post.delete({ where: { id } })
}
