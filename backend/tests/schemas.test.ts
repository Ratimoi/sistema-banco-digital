import { describe, expect, it } from "vitest"
import { createClienteSchema } from "../src/schemas/clienteSchema"
import { transferenciaSchema } from "../src/schemas/transacaoSchema"
import { idParamSchema, senhaForteSchema } from "../src/schemas/common"

describe("createClienteSchema", () => {
  it("rejeita CPF com formato inválido", () => {
    const result = createClienteSchema.safeParse({
      nome: "João Silva",
      cpf: "123",
      email: "joao@email.com",
      senha: "SenhaForte123!",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita senha fraca", () => {
    const result = createClienteSchema.safeParse({
      nome: "João Silva",
      cpf: "12345678900",
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
      senha: "SenhaForte123!",
    })
    expect(result.success).toBe(true)
  })

  it("aceita nivel opcional para conceder credencial de equipe", () => {
    const result = createClienteSchema.safeParse({
      nome: "João Silva",
      cpf: "12345678900",
      email: "joao@email.com",
      senha: "SenhaForte123!",
      nivel: 2,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.nivel).toBe(2)
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

describe("senhaForteSchema", () => {
  it.each([
    ["cA1!", false], // menos de 8 caracteres
    ["semmaiuscula1!", false],
    ["SEMMINUSCULA1!", false],
    ["SemNumeroAqui!", false],
    ["SemSimbolo123", false],
    ["SenhaForte123!", true],
  ])("%s -> valido=%s", (senha, esperado) => {
    expect(senhaForteSchema.safeParse(senha).success).toBe(esperado)
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
