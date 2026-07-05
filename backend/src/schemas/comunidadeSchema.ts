import { z } from "zod"

export const createPostSchema = z
  .object({
    conteudo: z.string().trim().min(1, "O post não pode ficar vazio").max(2000, "Post muito longo"),
    midiaUrl: z.string().trim().url("URL de mídia inválida").optional(),
    midiaTipo: z.enum(["imagem", "video"]).optional(),
  })
  .refine((data) => Boolean(data.midiaUrl) === Boolean(data.midiaTipo), {
    message: "midiaUrl e midiaTipo devem ser informados juntos",
    path: ["midiaTipo"],
  })

export type CreatePostInput = z.infer<typeof createPostSchema>
