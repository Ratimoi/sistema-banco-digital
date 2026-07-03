import { Router } from "express"
import {
  criarCliente,
  listarClientes,
  buscarCliente,
  atualizarCliente,
  deletarCliente,
} from "../controllers/clienteController"
import { enviarEmailCliente } from "../controllers/emailController"
import { validate } from "../middlewares/validate"
import { idParamSchema } from "../schemas/common"
import { createClienteSchema, updateClienteSchema } from "../schemas/clienteSchema"

const router = Router()

router.post("/", validate(createClienteSchema), criarCliente)
router.get("/", listarClientes)
router.get("/:id", validate(idParamSchema, "params"), buscarCliente)
router.put("/:id", validate(idParamSchema, "params"), validate(updateClienteSchema), atualizarCliente)
router.delete("/:id", validate(idParamSchema, "params"), deletarCliente)
router.get("/:id/email", validate(idParamSchema, "params"), enviarEmailCliente)

export default router
