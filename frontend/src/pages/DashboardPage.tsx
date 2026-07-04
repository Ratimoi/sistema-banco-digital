import { useState, useEffect } from "react"
import { getDashboardStats } from "../services/dashboardService"
import { toast } from "../components/ui"
import { DashboardStats } from "../types"

const empty: DashboardStats = {
  clientes: 0,
  contas: 0,
  transacoes: 0,
  emprestimos: 0,
  saldoTotal: "0",
  ultimasTransacoes: [],
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(empty)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats()
        setStats(res.data)
      } catch {
        toast.error("Erro ao carregar dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tipoBadge = (tipo: string) => {
    const map: Record<string, string> = { DEPOSITO: "badge-green", SAQUE: "badge-red", TRANSFERENCIA: "badge-blue" }
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
                  R$ {Number(stats.saldoTotal).toFixed(2)}
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
                {stats.ultimasTransacoes.length === 0 ? (
                  <div className="empty">
                    <div className="empty-text">Nenhuma transação ainda</div>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Descrição</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.ultimasTransacoes.map((t) => (
                        <tr key={t.id}>
                          <td className="mono" style={{ color: "var(--text3)" }}>
                            {t.id}
                          </td>
                          <td>
                            <span className={`badge ${tipoBadge(t.tipo)}`}>{t.tipo}</span>
                          </td>
                          <td className="mono" style={{ color: "var(--accent)" }}>
                            R$ {Number(t.valor).toFixed(2)}
                          </td>
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
