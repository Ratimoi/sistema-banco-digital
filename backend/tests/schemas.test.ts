import { describe, expect, it } from "vitest"
import { createClienteSchema } from "../src/schemas/clienteSchema"
import { transferenciaSchema } from "../src/schemas/transacaoSchema"
import { idParamSchema } from "../src/schemas/common"

describe("createClienteSchema", () => {
  it("rejeita CPF com formato inválido", () => {
    const result = createClienteSchema.safeParse({
      nome: "João Silva",
      cpf: "123",
      email: "joao@email.com",
      senha: "123456",
    })
    expect(result.success).toBe(false)
  })

  it("aceita um payload válido", () => {
    const result = createClienteSchema.safeParse({
      nome: "João Silva",
      cpf: "12345678900",
      email: "joao@email.com",
      senha: "123456",
    })
    expect(result.success).toBe(true)
  })
})

describe("transferenciaSchema", () => {
  it("rejeita transferência para a mesma conta", () => {
    const result = transferenciaSchema.safeParse({ origemId: 1, destinoId: 1, valor: 100 })
    expect(result.success).toBe(false)
  })

  it("rejeita valor negativo ou zero", () => {
    const result = transferenciaSchema.safeParse({ origemId: 1, destinoId: 2, valor: 0 })
    expect(result.success).toBe(false)
  })
})

describe("idParamSchema", () => {
  it("rejeita id não numérico", () => {
    expect(idParamSchema.safeParse({ id: "abc" }).success).toBe(false)
  })

  it("aceita id numérico positivo", () => {
    expect(idParamSchema.safeParse({ id: "42" }).success).toBe(true)
  })
})
