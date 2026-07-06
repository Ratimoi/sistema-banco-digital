import express from "express"
import request from "supertest"
import { describe, expect, it, vi, beforeEach } from "vitest"

const criarMock = vi.fn()
const atualizarMock = vi.fn()

vi.mock("../src/services/contaService", () => ({
  criar: (...args: unknown[]) => criarMock(...args),
  atualizar: (...args: unknown[]) => atualizarMock(...args),
  listar: vi.fn(),
  buscarPorId: vi.fn(),
  listarPorCliente: vi.fn(),
  deletar: vi.fn(),
}))

vi.mock("../src/services/logService", () => ({
  registrarLog: vi.fn(),
}))

const { criarConta, atualizarConta } = await import("../src/controllers/contaController")

// App mínimo: injeta req.nivel a partir de um header de teste, sem passar pela validação real.
const app = express()
app.use(express.json())
app.use((req, _res, next) => {
  req.nivel = Number(req.headers["x-test-nivel"] ?? 0)
  next()
})
app.post("/contas", criarConta)
app.put("/contas/:id", atualizarConta)

describe("contaController: proteção do campo saldo por nível", () => {
  beforeEach(() => {
    criarMock.mockReset().mockResolvedValue({ id: 1 })
    atualizarMock.mockReset().mockResolvedValue({ id: 1 })
  })

  it("nível 2 criando uma conta: o saldo enviado é descartado antes de chegar no service", async () => {
    await request(app)
      .post("/contas")
      .set("x-test-nivel", "2")
      .send({ numeroConta: "1001", tipo: "corrente", saldo: 5000, clienteId: 1 })

    const dadosRecebidos = criarMock.mock.calls[0][0]
    expect(dadosRecebidos.saldo).toBeUndefined()
    expect(dadosRecebidos.numeroConta).toBe("1001")
  })

  it("nível 3 criando uma conta: o saldo enviado é preservado", async () => {
    await request(app)
      .post("/contas")
      .set("x-test-nivel", "3")
      .send({ numeroConta: "1001", tipo: "corrente", saldo: 5000, clienteId: 1 })

    const dadosRecebidos = criarMock.mock.calls[0][0]
    expect(dadosRecebidos.saldo).toBe(5000)
  })

  it("nível 2 editando uma conta: tentativa de mudar o saldo é descartada", async () => {
    await request(app)
      .put("/contas/1")
      .set("x-test-nivel", "2")
      .send({ tipo: "poupanca", saldo: 999999 })

    const dadosRecebidos = atualizarMock.mock.calls[0][1]
    expect(dadosRecebidos.saldo).toBeUndefined()
    expect(dadosRecebidos.tipo).toBe("poupanca")
  })

  it("nível 3 editando uma conta: consegue alterar o saldo", async () => {
    await request(app).put("/contas/1").set("x-test-nivel", "3").send({ saldo: 999999 })

    const dadosRecebidos = atualizarMock.mock.calls[0][1]
    expect(dadosRecebidos.saldo).toBe(999999)
  })

  it("sem header de nível (equivalente a 0), o saldo também é descartado", async () => {
    await request(app).post("/contas").send({ numeroConta: "1001", tipo: "corrente", saldo: 100, clienteId: 1 })

    const dadosRecebidos = criarMock.mock.calls[0][0]
    expect(dadosRecebidos.saldo).toBeUndefined()
  })
})
