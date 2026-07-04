import { z } from "zod"

export const createEmprestimoSchema = z.object({
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  taxaJuros: z.coerce.number().min(0, "Taxa de juros não pode ser negativa"),
  parcelas: z.coerce.number().int().positive("Número de parcelas deve ser maior que zero"),
  status: z.enum(["pendente", "ativo", "rejeitado", "quitado", "inadimplente"]),
  clienteId: z.coerce.number().int().positive(),
})

export const updateEmprestimoSchema = createEmprestimoSchema.partial()

export type CreateEmprestimoInput = z.infer<typeof createEmprestimoSchema>
export type UpdateEmprestimoInput = z.infer<typeof updateEmprestimoSchema>
