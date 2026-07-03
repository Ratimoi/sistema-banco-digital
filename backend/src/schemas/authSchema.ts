import { z } from "zod"
import { senhaForteSchema } from "./usuarioSchema"

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const redefinirSenhaSchema = z.object({
  email: z.string().email("E-mail inválido"),
  codigo: z.string().min(1, "Código é obrigatório"),
  novaSenha: senhaForteSchema,
})

export type LoginInput = z.infer<typeof loginSchema>
export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>
