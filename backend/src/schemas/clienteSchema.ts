import { z } from "zod"
import { senhaForteSchema } from "./common"

export const createClienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().trim().email("E-mail inválido"),
  senha: senhaForteSchema,
  nivel: z.coerce.number().int().min(0).max(3).optional(),
})

export const updateClienteSchema = createClienteSchema.partial()

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
