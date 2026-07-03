import { z } from "zod"

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const clienteIdParamSchema = z.object({
  clienteId: z.coerce.number().int().positive(),
})

export const positiveMoney = z.coerce.number().positive("O valor deve ser maior que zero")
