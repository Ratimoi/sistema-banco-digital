import { z } from "zod"
import { positiveMoney } from "./common"

const numeroCartaoRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/

export const clienteSaqueSchema = z.object({
  cartaoNumero: z.string().trim().regex(numeroCartaoRegex, "Número de cartão inválido"),
  valor: positiveMoney,
})

export const clienteTransferenciaSchema = z.object({
  cartaoNumeroDestino: z.string().trim().regex(numeroCartaoRegex, "Número de cartão inválido"),
  valor: positiveMoney,
})

export type ClienteSaqueInput = z.infer<typeof clienteSaqueSchema>
export type ClienteTransferenciaInput = z.infer<typeof clienteTransferenciaSchema>
