import { Router } from "express"
import multer from "multer"
import rateLimit from "express-rate-limit"
import { criarPost, listarPosts, deletarPost, uploadMidia } from "../controllers/comunidadeController"
import { validate } from "../middlewares/validate"
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema } from "../schemas/common"
import { createPostSchema } from "../schemas/comunidadeSchema"

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

// Uploads são caros (chamada externa ao Supabase Storage + limite de 25MB por arquivo) — sem
// isso, uma conta autenticada poderia martelar o endpoint e esgotar banda/armazenamento.
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10 })

router.post("/", validate(createPostSchema), criarPost)
router.get("/", listarPosts)
router.post("/upload", uploadLimiter, upload.single("arquivo"), uploadMidia)
// Este router é montado tanto em /api/cliente/comunidade (qualquer conta autenticada) quanto
// em /api/comunidade (nível 1+); a checagem de nível precisa estar aqui, não só no mount, senão
// um cliente comum conseguiria excluir posts via /api/cliente/comunidade/:id.
router.delete("/:id", validate(idParamSchema, "params"), requireNivel(1), deletarPost)

export default router
