import clienteApi from "./clienteApi"

export const getMeusEmprestimos = () => clienteApi.get("/emprestimos")

export const solicitarEmprestimo = (data: { cartaoNumero: string; valor: number; parcelas: number }) =>
  clienteApi.post("/emprestimos", data)
