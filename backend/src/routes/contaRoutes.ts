import { Router } from "express"
import {
  criarConta,
  listarContas,
  buscarConta,
  contasPorCliente,
  atualizarConta,
  deletarConta,
} from "../controllers/contaController"
import { validate } from "../middlewares/validate"
import { idParamSchema, clienteIdParamSchema } from "../schemas/common"
import { createContaSchema, updateContaSchema } from "../schemas/contaSchema"

const router = Router()

router.post("/", validate(createContaSchema), criarConta)
router.get("/", listarContas)
router.get("/cliente/:clienteId", validate(clienteIdParamSchema, "params"), contasPorCliente)
router.get("/:id", validate(idParamSchema, "params"), buscarConta)
router.put("/:id", validate(idParamSchema, "params"), validate(updateContaSchema), atualizarConta)
router.delete("/:id", validate(idParamSchema, "params"), deletarConta)

export default router
