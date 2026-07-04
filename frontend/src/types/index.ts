export interface Paginated<T> {
  dados: T[]
  total: number
  pagina: number
  totalPaginas: number
}

export interface Cliente {
  id: number
  nome: string
  cpf: string
  email: string
  nivel: number
  createdAt: string
  conta?: Conta | null
}

export interface Conta {
  id: number
  numeroConta: string
  saldo: string
  tipo: string
  clienteId: number
  cliente?: { id: number; nome: string }
}

export interface Cartao {
  id: number
  numero: string
  validade: string
  cvv?: string
  tipo: string
  limite: string
  contaId: number
  conta?: { id: number; numeroConta: string }
}

export interface Emprestimo {
  id: number
  valor: string
  taxaJuros: string
  parcelas: number
  status: string
  clienteId: number
  cliente?: { id: number; nome: string }
}

export interface Transacao {
  id: number
  tipo: string
  valor: string
  descricao?: string | null
  createdAt: string
  contaOrigemId?: number | null
  contaDestinoId?: number | null
  contaOrigem?: { numeroConta: string } | null
  contaDestino?: { numeroConta: string } | null
}

export interface DashboardStats {
  clientes: number
  contas: number
  transacoes: number
  emprestimos: number
  saldoTotal: string
  ultimasTransacoes: Transacao[]
}
