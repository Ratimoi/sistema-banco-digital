import { z } from "zod"
import { positiveMoney } from "./common"

export const createClienteCartaoSchema = z.object({
  tipo: z.enum(["credito", "debito"]),
  limite: positiveMoney,
})

export type CreateClienteCartaoInput = z.infer<typeof createClienteCartaoSchema>
