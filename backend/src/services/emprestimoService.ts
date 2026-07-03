import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { CreateEmprestimoInput, UpdateEmprestimoInput } from "../schemas/emprestimoSchema"

export const criar = (data: CreateEmprestimoInput) => {
  return prisma.emprestimo.create({ data })
}

export const listar = () => {
  return prisma.emprestimo.findMany({
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { id: "asc" },
  })
}

export const buscarPorId = async (id: number) => {
  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id },
    include: { cliente: { select: { id: true, nome: true } } },
  })
  if (!emprestimo) throw new AppError("Empréstimo não encontrado", 404)
  return emprestimo
}

export const atualizar = (id: number, data: UpdateEmprestimoInput) => {
  return prisma.emprestimo.update({ where: { id }, data })
}

export const deletar = (id: number) => {
  return prisma.emprestimo.delete({ where: { id } })
}
