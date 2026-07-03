import { z } from "zod"
import { positiveMoney } from "./common"

export const depositoSchema = z.object({
  contaId: z.coerce.number().int().positive(),
  valor: positiveMoney,
})

export const saqueSchema = z.object({
  contaId: z.coerce.number().int().positive(),
  valor: positiveMoney,
})

export const transferenciaSchema = z
  .object({
    origemId: z.coerce.number().int().positive(),
    destinoId: z.coerce.number().int().positive(),
    valor: positiveMoney,
  })
  .refine((data) => data.origemId !== data.destinoId, {
    message: "Conta de origem e destino não podem ser a mesma",
    path: ["destinoId"],
  })

export type DepositoInput = z.infer<typeof depositoSchema>
export type SaqueInput = z.infer<typeof saqueSchema>
export type TransferenciaInput = z.infer<typeof transferenciaSchema>
