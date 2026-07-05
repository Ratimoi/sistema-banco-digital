import { Router } from "express"
import { criarPost, listarPosts, deletarPost } from "../controllers/comunidadeController"
import { validate } from "../middlewares/validate"
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema } from "../schemas/common"
import { createPostSchema } from "../schemas/comunidadeSchema"

const router = Router()

router.post("/", validate(createPostSchema), criarPost)
router.get("/", listarPosts)
// Este router é montado tanto em /api/cliente/comunidade (qualquer conta autenticada) quanto
// em /api/comunidade (nível 1+); a checagem de nível precisa estar aqui, não só no mount, senão
// um cliente comum conseguiria excluir posts via /api/cliente/comunidade/:id.
router.delete("/:id", validate(idParamSchema, "params"), requireNivel(1), deletarPost)

export default router
