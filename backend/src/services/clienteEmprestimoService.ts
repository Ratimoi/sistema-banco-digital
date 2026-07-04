import { Prisma } from "../../generated/prisma"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { SolicitarEmprestimoInput } from "../schemas/clienteEmprestimoSchema"

const TAXA_JUROS_PADRAO = 2.5

export const solicitar = async ({
  clienteId,
  cartaoNumero,
  valor,
  parcelas,
}: { clienteId: number } & SolicitarEmprestimoInput) => {
  const conta = await prisma.conta.findUnique({ where: { clienteId } })
  if (!conta) throw new AppError("Conta não encontrada", 404)

  const cartao = await prisma.cartao.findUnique({ where: { numero: cartaoNumero } })
  if (!cartao) throw new AppError("Cartão não encontrado", 404)
  if (cartao.contaId !== conta.id) throw new AppError("Cartão não pertence à sua conta", 403)
  if (cartao.tipo !== "credito") {
    throw new AppError("Empréstimo só pode ser solicitado com um cartão de crédito", 400)
  }
  if (new Prisma.Decimal(valor).greaterThan(cartao.limite)) {
    throw new AppError("Valor solicitado excede o limite do cartão", 400)
  }

  return prisma.emprestimo.create({
    data: { valor, taxaJuros: TAXA_JUROS_PADRAO, parcelas, status: "pendente", clienteId },
  })
}

export const listarPorCliente = (clienteId: number) => {
  return prisma.emprestimo.findMany({ where: { clienteId }, orderBy: { id: "desc" } })
}
