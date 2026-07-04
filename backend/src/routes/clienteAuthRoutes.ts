import { Router } from "express"
import { cadastro, login, esqueciSenha, redefinirSenha } from "../controllers/clienteAuthController"
import { validate } from "../middlewares/validate"
import {
  cadastroClienteSchema,
  loginClienteSchema,
  esqueciSenhaClienteSchema,
  redefinirSenhaClienteSchema,
} from "../schemas/clienteAuthSchema"

const router = Router()

router.post("/cadastro", validate(cadastroClienteSchema), cadastro)
router.post("/login", validate(loginClienteSchema), login)
router.post("/esqueci-senha", validate(esqueciSenhaClienteSchema), esqueciSenha)
router.post("/redefinir-senha", validate(redefinirSenhaClienteSchema), redefinirSenha)

export default router
