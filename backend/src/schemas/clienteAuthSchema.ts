import { z } from "zod"
import { senhaForteSchema } from "./usuarioSchema"

export const cadastroClienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  cpf: z.string().trim().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().trim().email("E-mail inválido"),
  senha: senhaForteSchema,
  tipoConta: z.enum(["corrente", "poupanca"]),
})

export const loginClienteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

export const esqueciSenhaClienteSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const redefinirSenhaClienteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  codigo: z.string().min(1, "Código é obrigatório"),
  novaSenha: senhaForteSchema,
})

export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>
export type LoginClienteInput = z.infer<typeof loginClienteSchema>
export type EsqueciSenhaClienteInput = z.infer<typeof esqueciSenhaClienteSchema>
export type RedefinirSenhaClienteInput = z.infer<typeof redefinirSenhaClienteSchema>
