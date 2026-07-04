import { z } from "zod"

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const clienteIdParamSchema = z.object({
  clienteId: z.coerce.number().int().positive(),
})

export const positiveMoney = z.coerce.number().positive("O valor deve ser maior que zero")

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const senhaForteSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter ao menos um símbolo")
