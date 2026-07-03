import { Router } from "express"
import { criarUsuario, listarUsuarios } from "../controllers/usuarioController"
import { validate } from "../middlewares/validate"
import { createUsuarioSchema } from "../schemas/usuarioSchema"

const router = Router()

router.post("/", validate(createUsuarioSchema), criarUsuario)
router.get("/", listarUsuarios)

export default router
