import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { CreateCartaoInput, UpdateCartaoInput } from "../schemas/cartaoSchema"
import { PaginationQuery } from "../schemas/common"
import { paginar } from "../utils/paginate"

// CVV nunca é devolvido pela API, mesmo tendo sido informado na criação/atualização.
export const cartaoSelect = {
  id: true,
  numero: true,
  validade: true,
  tipo: true,
  limite: true,
  contaId: true,
}

export const criar = (data: CreateCartaoInput) => {
  return prisma.cartao.create({ data, select: cartaoSelect })
}

export const listar = (paginacao: PaginationQuery) => {
  return paginar(
    () => prisma.cartao.count(),
    (skip, take) =>
      prisma.cartao.findMany({
        select: { ...cartaoSelect, conta: { select: { id: true, numeroConta: true } } },
        orderBy: { id: "asc" },
        skip,
        take,
      }),
    paginacao,
  )
}

export const buscarPorId = async (id: number) => {
  const cartao = await prisma.cartao.findUnique({
    where: { id },
    select: { ...cartaoSelect, conta: { select: { id: true, numeroConta: true } } },
  })
  if (!cartao) throw new AppError("Cartão não encontrado", 404)
  return cartao
}

export const atualizar = (id: number, data: UpdateCartaoInput) => {
  return prisma.cartao.update({ where: { id }, data, select: cartaoSelect })
}

export const deletar = (id: number) => {
  return prisma.cartao.delete({ where: { id } })
}
