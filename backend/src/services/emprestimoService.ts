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

export const aprovar = (id: number) => {
  return prisma.$transaction(async (tx) => {
    const emprestimo = await tx.emprestimo.findUnique({ where: { id } })
    if (!emprestimo) throw new AppError("Empréstimo não encontrado", 404)
    if (emprestimo.status !== "pendente") throw new AppError("Empréstimo já foi processado", 409)

    const conta = await tx.conta.findUnique({ where: { clienteId: emprestimo.clienteId } })
    if (!conta) throw new AppError("Conta do cliente não encontrada", 404)

    await tx.conta.update({
      where: { id: conta.id },
      data: { saldo: conta.saldo.plus(emprestimo.valor) },
    })

    await tx.transacao.create({
      data: {
        tipo: "EMPRESTIMO_LIBERADO",
        valor: emprestimo.valor,
        contaDestinoId: conta.id,
        descricao: `Empréstimo #${id} aprovado`,
      },
    })

    return tx.emprestimo.update({ where: { id }, data: { status: "ativo" } })
  })
}

export const rejeitar = async (id: number) => {
  const emprestimo = await prisma.emprestimo.findUnique({ where: { id } })
  if (!emprestimo) throw new AppError("Empréstimo não encontrado", 404)
  if (emprestimo.status !== "pendente") throw new AppError("Empréstimo já foi processado", 409)
  return prisma.emprestimo.update({ where: { id }, data: { status: "rejeitado" } })
}
