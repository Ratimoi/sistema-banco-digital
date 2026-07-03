import { Router } from "express"
import {
  criarEmprestimo,
  listarEmprestimos,
  buscarEmprestimo,
  atualizarEmprestimo,
  deletarEmprestimo,
} from "../controllers/emprestimoController"
import { validate } from "../middlewares/validate"
import { idParamSchema } from "../schemas/common"
import { createEmprestimoSchema, updateEmprestimoSchema } from "../schemas/emprestimoSchema"

const router = Router()

router.post("/", validate(createEmprestimoSchema), criarEmprestimo)
router.get("/", listarEmprestimos)
router.get("/:id", validate(idParamSchema, "params"), buscarEmprestimo)
router.put("/:id", validate(idParamSchema, "params"), validate(updateEmprestimoSchema), atualizarEmprestimo)
router.delete("/:id", validate(idParamSchema, "params"), deletarEmprestimo)

export default router
