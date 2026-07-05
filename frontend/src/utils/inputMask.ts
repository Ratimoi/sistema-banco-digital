// Restringe o que o usuário consegue digitar nos campos que têm um formato fixo esperado pelo
// backend (CPF, número de cartão, validade, CVV) — em vez de só validar no envio do formulário.

export const somenteDigitos = (valor: string, max?: number) => {
  const digitos = valor.replace(/\D/g, "")
  return max ? digitos.slice(0, max) : digitos
}

export const formatarNumeroCartao = (valor: string) => {
  const digitos = somenteDigitos(valor, 16)
  return digitos.replace(/(\d{4})(?=\d)/g, "$1-")
}

export const formatarValidade = (valor: string) => {
  const digitos = somenteDigitos(valor, 4)
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
}
