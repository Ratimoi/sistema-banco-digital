import { z } from "zod"

export const senhaForteSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter ao menos um símbolo")

export const createUsuarioSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("E-mail inválido"),
  senha: senhaForteSchema,
  nivel: z.coerce.number().int().min(1).max(3).default(1),
})

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>
