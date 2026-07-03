import { Router } from "express"
import { login, esqueciSenha, redefinirSenha } from "../controllers/authController"
import { validate } from "../middlewares/validate"
import { loginSchema, esqueciSenhaSchema, redefinirSenhaSchema } from "../schemas/authSchema"

const router = Router()

router.post("/login", validate(loginSchema), login)
router.post("/esqueci-senha", validate(esqueciSenhaSchema), esqueciSenha)
router.post("/redefinir-senha", validate(redefinirSenhaSchema), redefinirSenha)

export default router
