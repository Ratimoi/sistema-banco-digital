import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { executarSaque, executarTransferencia } from "./transacaoService"
import { ClienteSaqueInput, ClienteTransferenciaInput } from "../schemas/clienteTransacaoSchema"

export const saquePorCartao = ({
  clienteId,
  cartaoNumero,
  valor,
}: { clienteId: number } & ClienteSaqueInput) => {
  return prisma.$transaction(async (tx) => {
    const conta = await tx.conta.findUnique({ where: { clienteId } })
    if (!conta) throw new AppError("Conta não encontrada", 404)

    const cartao = await tx.cartao.findUnique({ where: { numero: cartaoNumero } })
    if (!cartao) throw new AppError("Cartão não encontrado", 404)
    if (cartao.contaId !== conta.id) throw new AppError("Cartão não pertence à sua conta", 403)
    if (cartao.tipo !== "debito") {
      throw new AppError(
        "Saque só pode ser feito com cartão de débito. Para usar crédito, solicite um empréstimo.",
        400,
      )
    }

    return executarSaque(tx, conta.id, valor)
  })
}

export const transferenciaPorCartao = ({
  clienteId,
  cartaoNumeroDestino,
  valor,
}: { clienteId: number } & ClienteTransferenciaInput) => {
  return prisma.$transaction(async (tx) => {
    const origem = await tx.conta.findUnique({ where: { clienteId } })
    if (!origem) throw new AppError("Conta não encontrada", 404)

    const cartaoDestino = await tx.cartao.findUnique({ where: { numero: cartaoNumeroDestino } })
    if (!cartaoDestino) throw new AppError("Cartão de destino não encontrado", 404)
    if (cartaoDestino.contaId === origem.id) {
      throw new AppError("Não é possível transferir para a própria conta", 400)
    }

    return executarTransferencia(tx, origem.id, cartaoDestino.contaId, valor)
  })
}
