import { Router } from "express"
import { criarCliente, listarClientes, deletarCliente } from "../controllers/clienteController"
import { enviarEmailCliente } from "../controllers/emailController"

const router = Router()

router.post("/", criarCliente)
router.get("/", listarClientes)
router.delete("/:id", deletarCliente)
router.get("/:id/email", enviarEmailCliente)

export default router