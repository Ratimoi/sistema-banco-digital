import { z } from "zod"

export const createPostSchema = z.object({
  conteudo: z.string().trim().min(1, "O post não pode ficar vazio").max(2000, "Post muito longo"),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
