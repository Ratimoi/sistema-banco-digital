import { describe, it, expect } from "vitest"
import { somenteDigitos, formatarNumeroCartao, formatarValidade } from "./inputMask"

describe("somenteDigitos", () => {
  it("remove tudo que não é dígito", () => {
    expect(somenteDigitos("123.456-789")).toBe("123456789")
  })

  it("corta no máximo informado", () => {
    expect(somenteDigitos("123456789012", 5)).toBe("12345")
  })

  it("sem max, mantém todos os dígitos", () => {
    expect(somenteDigitos("abc123def456")).toBe("123456")
  })
})

describe("formatarNumeroCartao", () => {
  it("formata em blocos de 4 dígitos separados por hífen", () => {
    expect(formatarNumeroCartao("1111222233334444")).toBe("1111-2222-3333-4444")
  })

  it("ignora caracteres não numéricos ao formatar", () => {
    expect(formatarNumeroCartao("1111 2222 3333 4444")).toBe("1111-2222-3333-4444")
  })

  it("corta em 16 dígitos mesmo se o usuário digitar mais", () => {
    expect(formatarNumeroCartao("11112222333344445555")).toBe("1111-2222-3333-4444")
  })

  it("formata parcialmente enquanto o usuário ainda está digitando", () => {
    expect(formatarNumeroCartao("11112")).toBe("1111-2")
  })
})

describe("formatarValidade", () => {
  it("insere a barra depois do segundo dígito", () => {
    expect(formatarValidade("1230")).toBe("12/30")
  })

  it("não insere barra com 2 dígitos ou menos", () => {
    expect(formatarValidade("12")).toBe("12")
  })

  it("corta em 4 dígitos", () => {
    expect(formatarValidade("123099")).toBe("12/30")
  })
})
