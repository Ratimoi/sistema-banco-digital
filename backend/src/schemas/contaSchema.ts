import { z } from "zod"

export const createContaSchema = z.object({
  numeroConta: z.string().trim().min(1, "Número da conta é obrigatório"),
  tipo: z.enum(["corrente", "poupanca"]),
  saldo: z.coerce.number().min(0, "Saldo inicial não pode ser negativo").default(0),
  clienteId: z.coerce.number().int().positive(),
})

export const updateContaSchema = createContaSchema.partial()

export type CreateContaInput = z.infer<typeof createContaSchema>
export type UpdateContaInput = z.infer<typeof updateContaSchema>
