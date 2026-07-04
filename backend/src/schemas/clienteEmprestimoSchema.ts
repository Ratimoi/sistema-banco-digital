import { z } from "zod"
import { positiveMoney } from "./common"

export const solicitarEmprestimoSchema = z.object({
  cartaoNumero: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, "Número de cartão inválido"),
  valor: positiveMoney,
  parcelas: z.coerce.number().int().positive("Número de parcelas deve ser maior que zero"),
})

export type SolicitarEmprestimoInput = z.infer<typeof solicitarEmprestimoSchema>
