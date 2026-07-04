import { Prisma } from "../../generated/prisma"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { DepositoInput, SaqueInput, TransferenciaInput } from "../schemas/transacaoSchema"

export const listar = () => {
  return prisma.transacao.findMany({
    include: { contaOrigem: true, contaDestino: true },
    orderBy: { id: "desc" },
  })
}

export const listarPorConta = (contaId: number) => {
  return prisma.transacao.findMany({
    where: { OR: [{ contaOrigemId: contaId }, { contaDestinoId: contaId }] },
    orderBy: { id: "desc" },
  })
}

export const buscarPorId = async (id: number) => {
  const transacao = await prisma.transacao.findUnique({
    where: { id },
    include: { contaOrigem: true, contaDestino: true },
  })
  if (!transacao) throw new AppError("Transação não encontrada", 404)
  return transacao
}

export const executarSaque = async (tx: Prisma.TransactionClient, contaId: number, valor: number) => {
  const conta = await tx.conta.findUnique({ where: { id: contaId } })
  if (!conta) throw new AppError("Conta não encontrada", 404)
  if (conta.saldo.lessThan(valor)) throw new AppError("Saldo insuficiente", 400)

  await tx.conta.update({
    where: { id: contaId },
    data: { saldo: conta.saldo.minus(valor) },
  })

  return tx.transacao.create({
    data: {
      tipo: "SAQUE",
      valor,
      contaOrigemId: contaId,
      descricao: "Saque em conta",
    },
  })
}

export const executarTransferencia = async (
  tx: Prisma.TransactionClient,
  origemId: number,
  destinoId: number,
  valor: number,
) => {
  const origem = await tx.conta.findUnique({ where: { id: origemId } })
  const destino = await tx.conta.findUnique({ where: { id: destinoId } })

  if (!origem || !destino) throw new AppError("Conta não encontrada", 404)
  if (origem.saldo.lessThan(valor)) throw new AppError("Saldo insuficiente", 400)

  await tx.conta.update({
    where: { id: origemId },
    data: { saldo: origem.saldo.minus(valor) },
  })

  await tx.conta.update({
    where: { id: destinoId },
    data: { saldo: destino.saldo.plus(valor) },
  })

  return tx.transacao.create({
    data: {
      tipo: "TRANSFERENCIA",
      valor,
      contaOrigemId: origemId,
      contaDestinoId: destinoId,
      descricao: "Transferência entre contas",
    },
  })
}

export const deposito = ({ contaId, valor }: DepositoInput) => {
  return prisma.$transaction(async (tx) => {
    const conta = await tx.conta.findUnique({ where: { id: contaId } })
    if (!conta) throw new AppError("Conta não encontrada", 404)

    await tx.conta.update({
      where: { id: contaId },
      data: { saldo: conta.saldo.plus(valor) },
    })

    return tx.transacao.create({
      data: {
        tipo: "DEPOSITO",
        valor,
        contaDestinoId: contaId,
        descricao: "Depósito em conta",
      },
    })
  })
}

export const saque = ({ contaId, valor }: SaqueInput) => {
  return prisma.$transaction((tx) => executarSaque(tx, contaId, valor))
}

export const transferencia = ({ origemId, destinoId, valor }: TransferenciaInput) => {
  return prisma.$transaction((tx) => executarTransferencia(tx, origemId, destinoId, valor))
}
