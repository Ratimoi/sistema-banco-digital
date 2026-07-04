import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { cartaoSelect } from "./cartaoService"
import { CreateClienteCartaoInput } from "../schemas/clienteCartaoSchema"

const gerarBlocoNumerico = () => Math.floor(1000 + Math.random() * 9000).toString()

const gerarNumeroCartao = () =>
  `${gerarBlocoNumerico()}-${gerarBlocoNumerico()}-${gerarBlocoNumerico()}-${gerarBlocoNumerico()}`

const gerarValidade = () => {
  const daquiA5Anos = new Date()
  daquiA5Anos.setFullYear(daquiA5Anos.getFullYear() + 5)
  const mes = String(daquiA5Anos.getMonth() + 1).padStart(2, "0")
  const ano = String(daquiA5Anos.getFullYear()).slice(-2)
  return `${mes}/${ano}`
}

const gerarCvv = () => Math.floor(100 + Math.random() * 900).toString()

const gerarNumeroCartaoUnico = async () => {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const numero = gerarNumeroCartao()
    const existente = await prisma.cartao.findUnique({ where: { numero } })
    if (!existente) return numero
  }
  throw new AppError("Não foi possível gerar um número de cartão. Tente novamente.", 500)
}

const buscarContaDoCliente = async (clienteId: number) => {
  const conta = await prisma.conta.findUnique({ where: { clienteId } })
  if (!conta) throw new AppError("Conta não encontrada", 404)
  return conta
}

export const criarParaCliente = async (clienteId: number, data: CreateClienteCartaoInput) => {
  const conta = await buscarContaDoCliente(clienteId)
  const numero = await gerarNumeroCartaoUnico()

  return prisma.cartao.create({
    data: {
      ...data,
      numero,
      validade: gerarValidade(),
      cvv: gerarCvv(),
      contaId: conta.id,
    },
    select: cartaoSelect,
  })
}

export const listarPorCliente = async (clienteId: number) => {
  const conta = await buscarContaDoCliente(clienteId)
  return prisma.cartao.findMany({ where: { contaId: conta.id }, select: cartaoSelect })
}
