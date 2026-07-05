import { createClient } from "@supabase/supabase-js"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

// O @supabase/supabase-js exige um WebSocket global mesmo só usando o Storage (não Realtime),
// e o Node 20 (usado na imagem do backend) não tem WebSocket nativo — só a partir do Node 22.
if (!globalThis.WebSocket) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.WebSocket = require("ws")
}

const BUCKET = "comunidade-midia"

const TIPOS_PERMITIDOS: Record<string, "imagem" | "video"> = {
  "image/jpeg": "imagem",
  "image/png": "imagem",
  "image/gif": "imagem",
  "image/webp": "imagem",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
}

const getSupabase = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError("Upload de mídia não está configurado", 503)
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}

export const enviarMidia = async (file: Express.Multer.File) => {
  const midiaTipo = TIPOS_PERMITIDOS[file.mimetype]
  if (!midiaTipo) throw new AppError("Tipo de arquivo não suportado", 400)

  const supabase = getSupabase()
  const extensao = file.originalname.split(".").pop() ?? "bin"
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file.buffer, {
    contentType: file.mimetype,
  })
  if (error) throw new AppError(`Falha ao enviar mídia: ${error.message}`, 502)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return { url: data.publicUrl, tipo: midiaTipo }
}

// Usado ao excluir um post (manual ou pela limpeza automática de posts antigos) para não deixar
// arquivo órfão no bucket. Silenciosamente ignora se o Supabase não estiver configurado ou a URL
// não bater com o formato esperado — não deve impedir a exclusão do post em si.
export const removerMidia = async (url: string) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return

  const marcador = `/storage/v1/object/public/${BUCKET}/`
  const indice = url.indexOf(marcador)
  if (indice === -1) return

  const caminho = url.slice(indice + marcador.length)
  const supabase = getSupabase()
  await supabase.storage.from(BUCKET).remove([caminho])
}
