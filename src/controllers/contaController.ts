import { prisma } from "../../lib/prisma"

// CREATE CONTA
export const criarConta = async (req: any, res: any) => {
    const conta = await prisma.conta.create({
        data: req.body
    })

    return res.json(conta)
}

// LISTAR CONTAS POR CLIENTE
export const contasPorCliente = async (req: any, res: any) => {
    const { clienteId } = req.params

    const contas = await prisma.conta.findMany({
        where: { clienteId: Number(clienteId) },
        include: {
            transacoesEnviadas: true,
            transacoesRecebidas: true
        }
    })

    return res.json(contas)
}