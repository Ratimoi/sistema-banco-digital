import { useState, useEffect } from "react"
import { getClientes } from "../services/clienteService"
import { getContas } from "../services/contaService"
import { getTransacoes } from "../services/transacaoService"
import { getEmprestimos } from "../services/emprestimoService"
import { toast } from "../components/ui"

export default function DashboardPage() {
  const [stats, setStats] = useState({ clientes: 0, contas: 0, transacoes: 0, emprestimos: 0, saldoTotal: 0 })
  const [ultimas, setUltimas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [cl, co, tr, em] = await Promise.all([getClientes(), getContas(), getTransacoes(), getEmprestimos()])
        const saldoTotal = co.data.reduce((acc: number, c: any) => acc + Number(c.saldo), 0)
        setStats({ clientes: cl.data.length, contas: co.data.length, transacoes: tr.data.length, emprestimos: em.data.length, saldoTotal })
        setUltimas(tr.data.slice(-5).reverse())
      } catch { toast.error("Erro ao carregar dashboard") }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const tipoBadge = (tipo: string) => {
    const map: any = { DEPOSITO: "badge-green", SAQUE: "badge-red", TRANSFERENCIA: "badge-blue" }
    return map[tipo] ?? "badge-yellow"
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Visão geral do sistema</div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Clientes</div>
                <div className="stat-value stat-blue">{stats.clientes}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Contas</div>
                <div className="stat-value stat-yellow">{stats.contas}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Saldo Total</div>
                <div className="stat-value stat-green" style={{ fontSize: 20 }}>
                  R$ {stats.saldoTotal.toFixed(2)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Transações</div>
                <div className="stat-value stat-red">{stats.transacoes}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Últimas Transações</span>
              </div>
              <div className="table-wrap">
                {ultimas.length === 0 ? (
                  <div className="empty"><div className="empty-text">Nenhuma transação ainda</div></div>
                ) : (
                  <table>
                    <thead>
                      <tr><th>#</th><th>Tipo</th><th>Valor</th><th>Descrição</th><th>Data</th></tr>
                    </thead>
                    <tbody>
                      {ultimas.map(t => (
                        <tr key={t.id}>
                          <td className="mono" style={{ color: "var(--text3)" }}>{t.id}</td>
                          <td><span className={`badge ${tipoBadge(t.tipo)}`}>{t.tipo}</span></td>
                          <td className="mono" style={{ color: "var(--accent)" }}>R$ {Number(t.valor).toFixed(2)}</td>
                          <td style={{ color: "var(--text2)" }}>{t.descricao ?? "—"}</td>
                          <td className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>
                            {new Date(t.createdAt).toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
