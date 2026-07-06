import { Router } from "express"
import clienteRoutes from "./clienteRoutes"
import contaRoutes from "./contaRoutes"
import transacaoRoutes from "./transacaoRoutes"
import emprestimoRoutes from "./emprestimoRoutes"
import cartaoRoutes from "./cartaoRoutes"
import logRoutes from "./logRoutes"
import dashboardRoutes from "./dashboardRoutes"

const router = Router()

// A Comunidade é montada separadamente em server.ts (nível 1+, antes deste mount de nível 2+).
router.use("/clientes", clienteRoutes)
router.use("/contas", contaRoutes)
router.use("/transacoes", transacaoRoutes)
router.use("/emprestimos", emprestimoRoutes)
router.use("/cartoes", cartaoRoutes)
router.use("/logs", logRoutes)
router.use("/dashboard", dashboardRoutes)

export default router
