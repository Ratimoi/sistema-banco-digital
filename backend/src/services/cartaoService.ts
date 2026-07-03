import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { CreateCartaoInput, UpdateCartaoInput } from "../schemas/cartaoSchema"

// CVV nunca é devolvido pela API, mesmo tendo sido informado na criação/atualização.
const cartaoSelect = {
  id: true,
  numero: true,
  validade: true,
  tipo: true,
  contaId: true,
}

export const criar = (data: CreateCartaoInput) => {
  return prisma.cartao.create({ data, select: cartaoSelect })
}

export const listar = () => {
  return prisma.cartao.findMany({
    select: { ...cartaoSelect, conta: { select: { id: true, numeroConta: true } } },
    orderBy: { id: "asc" },
  })
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
