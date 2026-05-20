import { Router } from "express"
import { criarEmprestimo, listarEmprestimos, buscarEmprestimo, atualizarEmprestimo, deletarEmprestimo } from "../controllers/emprestimoController"

const router = Router()

router.post("/", criarEmprestimo)
router.get("/", listarEmprestimos)
router.get("/:id", buscarEmprestimo)
router.put("/:id", atualizarEmprestimo)
router.delete("/:id", deletarEmprestimo)

export default router
