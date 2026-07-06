import express from "express"
import request from "supertest"
import { describe, expect, it, vi } from "vitest"

// Substitui o auth real por um que lê o nível de um header de teste — isola o teste da lógica de
// JWT (já coberta em auth.test.ts) para focar só no roteamento/gating por nível.
vi.mock("../src/middlewares/auth", () => ({
  auth: (req: { nivel?: number; clienteId?: number; headers: Record<string, string> }, _res: unknown, next: () => void) => {
    req.nivel = Number(req.headers["x-test-nivel"] ?? 0)
    req.clienteId = 1
    next()
  },
}))

// Pula a validação de schema (zod) — o foco aqui é só "essa requisição passa do requireNivel?",
// não a validação do corpo de cada endpoint (já coberta nos testes de cada schema/controller).
vi.mock("../src/middlewares/validate", () => ({
  validate: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// Substitui todos os controllers por um stub genérico — assim o teste não depende de Prisma nem
// de lógica de negócio real, só do roteamento/gating por nível.
const stub = () => (_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) =>
  res.status(200).json({ ok: true })

vi.mock("../src/controllers/clienteController", () => ({
  criarCliente: stub(),
  listarClientes: stub(),
  buscarCliente: stub(),
  atualizarCliente: stub(),
  deletarCliente: stub(),
}))
vi.mock("../src/controllers/contaController", () => ({
  criarConta: stub(),
  listarContas: stub(),
  buscarConta: stub(),
  contasPorCliente: stub(),
  atualizarConta: stub(),
  deletarConta: stub(),
}))
vi.mock("../src/controllers/cartaoController", () => ({
  criarCartao: stub(),
  listarCartoes: stub(),
  buscarCartao: stub(),
  atualizarCartao: stub(),
  deletarCartao: stub(),
}))
vi.mock("../src/controllers/emprestimoController", () => ({
  criarEmprestimo: stub(),
  listarEmprestimos: stub(),
  buscarEmprestimo: stub(),
  atualizarEmprestimo: stub(),
  deletarEmprestimo: stub(),
  aprovarEmprestimo: stub(),
  rejeitarEmprestimo: stub(),
}))
vi.mock("../src/controllers/transacaoController", () => ({
  listarTransacoes: stub(),
  buscarTransacao: stub(),
  deposito: stub(),
  saque: stub(),
  transferencia: stub(),
}))
vi.mock("../src/controllers/logController", () => ({
  listarLogs: stub(),
}))
vi.mock("../src/controllers/dashboardController", () => ({
  obterStats: stub(),
}))
vi.mock("../src/controllers/comunidadeController", () => ({
  criarPost: stub(),
  listarPosts: stub(),
  deletarPost: stub(),
  uploadMidia: stub(),
}))
vi.mock("../src/controllers/emailController", () => ({
  enviarEmailCliente: stub(),
}))

const { auth } = await import("../src/middlewares/auth")
const { requireNivel } = await import("../src/middlewares/nivel")
const { default: routes } = await import("../src/routes")
const { default: comunidadeRoutes } = await import("../src/routes/comunidadeRoutes")

const app = express()
app.use(express.json())
app.use("/api/comunidade", auth, requireNivel(1), comunidadeRoutes)
app.use("/api", auth, requireNivel(2), routes)

const como = (nivel: number) => ({ "x-test-nivel": String(nivel) })

describe("Gating por nível entre os mounts de rota", () => {
  it("nível 1 acessa a Comunidade", async () => {
    const res = await request(app).get("/api/comunidade").set(como(1))
    expect(res.status).toBe(200)
  })

  it("nível 1 é bloqueado (403) em clientes, contas, cartões, empréstimos, dashboard e logs", async () => {
    const rotas = ["/api/clientes", "/api/contas", "/api/cartoes", "/api/emprestimos", "/api/dashboard/stats", "/api/logs"]
    for (const rota of rotas) {
      const res = await request(app).get(rota).set(como(1))
      expect(res.status).toBe(403)
    }
  })

  it("nível 1 é bloqueado (403) até para listar transações (histórico)", async () => {
    const res = await request(app).get("/api/transacoes").set(como(1))
    expect(res.status).toBe(403)
  })

  it("nível 2 acessa clientes, contas, cartões, empréstimos, dashboard e logs", async () => {
    const rotas = ["/api/clientes", "/api/contas", "/api/cartoes", "/api/emprestimos", "/api/dashboard/stats", "/api/logs"]
    for (const rota of rotas) {
      const res = await request(app).get(rota).set(como(2))
      expect(res.status).toBe(200)
    }
  })

  it("nível 2 lê o histórico de transações, mas é bloqueado (403) em depósito/saque/transferência", async () => {
    const historico = await request(app).get("/api/transacoes").set(como(2))
    expect(historico.status).toBe(200)

    const deposito = await request(app).post("/api/transacoes/deposito").set(como(2)).send({})
    expect(deposito.status).toBe(403)

    const saque = await request(app).post("/api/transacoes/saque").set(como(2)).send({})
    expect(saque.status).toBe(403)

    const transferencia = await request(app).post("/api/transacoes/transferencia").set(como(2)).send({})
    expect(transferencia.status).toBe(403)
  })

  it("nível 3 acessa depósito, saque e transferência", async () => {
    const rotas = ["/api/transacoes/deposito", "/api/transacoes/saque", "/api/transacoes/transferencia"]
    for (const rota of rotas) {
      const res = await request(app).post(rota).set(como(3)).send({})
      expect(res.status).toBe(200)
    }
  })

  it("nível 0 (cliente comum) é bloqueado (403) até na Comunidade administrativa", async () => {
    const res = await request(app).get("/api/comunidade").set(como(0))
    expect(res.status).toBe(403)
  })
})
