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
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema, paginationQuerySchema } from "../schemas/common"
import { createClienteSchema, updateClienteSchema } from "../schemas/clienteSchema"

const router = Router()

router.post("/", validate(createClienteSchema), criarCliente)
router.get("/", validate(paginationQuerySchema, "query"), listarClientes)
router.get("/:id", validate(idParamSchema, "params"), buscarCliente)
router.put("/:id", validate(idParamSchema, "params"), validate(updateClienteSchema), atualizarCliente)
router.delete("/:id", validate(idParamSchema, "params"), requireNivel(3), deletarCliente)
router.get("/:id/email", validate(idParamSchema, "params"), enviarEmailCliente)

export default router
