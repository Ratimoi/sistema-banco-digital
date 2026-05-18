import { Router } from "express"

import clienteRoutes from "./clienteRoutes"
import contaRoutes from "./contaRoutes"
import transacaoRoutes from "./transacaoRoutes"
import emprestimoRoutes from "./emprestimoRoutes"
import cartaoRoutes from "./cartaoRoutes"

const router = Router()

// prefixos da API
router.use("/clientes", clienteRoutes)
router.use("/contas", contaRoutes)
router.use("/transacoes", transacaoRoutes)
router.use("/emprestimos", emprestimoRoutes)
router.use("/cartoes", cartaoRoutes)

export default router