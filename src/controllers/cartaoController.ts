import { prisma } from "../../lib/prisma"

export const criarCartao = async (req: any, res: any) => {
    const cartao = await prisma.cartao.create({
        data: req.body
    })

    return res.json(cartao)
}

export const listarCartoes = async (req: any, res: any) => {
    const cartoes = await prisma.cartao.findMany({
        include: { conta: true }
    })

    return res.json(cartoes)
}