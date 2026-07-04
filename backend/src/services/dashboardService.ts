import { prisma } from "../lib/prisma"

export const obterStats = async () => {
  const [clientes, contas, transacoes, emprestimos, saldoAgregado, ultimasTransacoes] = await Promise.all([
    prisma.cliente.count(),
    prisma.conta.count(),
    prisma.transacao.count(),
    prisma.emprestimo.count(),
    prisma.conta.aggregate({ _sum: { saldo: true } }),
    prisma.transacao.findMany({ orderBy: { id: "desc" }, take: 5 }),
  ])

  return {
    clientes,
    contas,
    transacoes,
    emprestimos,
    saldoTotal: saldoAgregado._sum.saldo ?? 0,
    ultimasTransacoes,
  }
}
