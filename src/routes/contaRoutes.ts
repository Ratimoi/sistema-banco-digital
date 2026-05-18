import { Router } from "express";
import { criarConta, contasPorCliente } from "../controllers/contaController";

const router = Router();

router.post("/", criarConta);
router.get("/cliente/:clienteId", contasPorCliente);

export default router;