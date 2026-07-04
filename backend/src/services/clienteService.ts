import { prisma } from "../lib/prisma"
import { hashPassword } from "../utils/hash"
import { CreateClienteInput, UpdateClienteInput } from "../schemas/clienteSchema"

const clienteSelect = {
  id: true,
  nome: true,
  cpf: true,
  email: true,
  nivel: true,
  createdAt: true,
}

export const criar = async (data: CreateClienteInput) => {
  const senhaHash = await hashPassword(data.senha)
  return prisma.cliente.create({
    data: { ...data, senha: senhaHash },
    select: clienteSelect,
  })
}

export const listar = () => {
  return prisma.cliente.findMany({
    select: { ...clienteSelect, conta: true },
    orderBy: { id: "asc" },
  })
}

export const buscarPorId = (id: number) => {
  return prisma.cliente.findUnique({
    where: { id },
    select: { ...clienteSelect, conta: true, emprestimos: true },
  })
}

export const atualizar = async (id: number, data: UpdateClienteInput) => {
  const senha = data.senha ? await hashPassword(data.senha) : undefined
  return prisma.cliente.update({
    where: { id },
    data: { ...data, senha },
    select: clienteSelect,
  })
}

export const deletar = (id: number) => {
  return prisma.cliente.delete({ where: { id } })
}
