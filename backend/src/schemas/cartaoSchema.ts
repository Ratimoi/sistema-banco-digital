import { z } from "zod"
import { positiveMoney } from "./common"

export const createCartaoSchema = z.object({
  numero: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, "Número deve estar no formato 0000-0000-0000-0000"),
  validade: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Validade deve estar no formato MM/AA"),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVV deve ter 3 ou 4 dígitos"),
  tipo: z.enum(["credito", "debito"]),
  limite: positiveMoney,
  contaId: z.coerce.number().int().positive(),
})

export const updateCartaoSchema = createCartaoSchema.partial()

export type CreateCartaoInput = z.infer<typeof createCartaoSchema>
export type UpdateCartaoInput = z.infer<typeof updateCartaoSchema>
