import { Router } from "express"
import { cadastro, login, esqueciSenha, redefinirSenha, refresh } from "../controllers/clienteAuthController"
import { validate } from "../middlewares/validate"
import {
  cadastroClienteSchema,
  loginClienteSchema,
  esqueciSenhaClienteSchema,
  redefinirSenhaClienteSchema,
  refreshTokenSchema,
} from "../schemas/clienteAuthSchema"

const router = Router()

router.post("/cadastro", validate(cadastroClienteSchema), cadastro)
router.post("/login", validate(loginClienteSchema), login)
router.post("/esqueci-senha", validate(esqueciSenhaClienteSchema), esqueciSenha)
router.post("/redefinir-senha", validate(redefinirSenhaClienteSchema), redefinirSenha)
router.post("/refresh", validate(refreshTokenSchema), refresh)

export default router
