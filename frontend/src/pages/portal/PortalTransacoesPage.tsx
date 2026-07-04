import { useState, useEffect } from "react"
import { getMinhasTransacoes, saque, transferencia } from "../../services/clienteTransacaoService"
import { getMeusCartoes } from "../../services/clienteCartaoService"
import { getMeusEmprestimos, solicitarEmprestimo } from "../../services/clienteEmprestimoService"
import { toast } from "../../components/ui"

type Tab = "historico" | "saque" | "transferencia" | "emprestimo"

export default function PortalTransacoesPage() {
  const [tab, setTab] = useState<Tab>("historico")
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [cartoes, setCartoes] = useState<any[]>([])
  const [emprestimos, setEmprestimos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fSaque, setFSaque] = useState({ cartaoNumero: "", valor: "" })
  const [fTransferencia, setFTransferencia] = useState({ cartaoNumeroDestino: "", valor: "" })
  const [fEmprestimo, setFEmprestimo] = useState({ cartaoNumero: "", valor: "", parcelas: "" })

  const load = async () => {
    try {
      const [t, c, e] = await Promise.all([getMinhasTransacoes(), getMeusCartoes(), getMeusEmprestimos()])
      setTransacoes(t.data)
      setCartoes(c.data)
      setEmprestimos(e.data)
    } catch {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const cartoesDebito = cartoes.filter((c) => c.tipo === "debito")
  const cartoesCredito = cartoes.filter((c) => c.tipo === "credito")

  const handleSaque = async () => {
    setSaving(true)
    try {
      await saque({ cartaoNumero: fSaque.cartaoNumero, valor: Number(fSaque.valor) })
      toast.success("Saque realizado!")
      setFSaque({ cartaoNumero: "", valor: "" })
      load()
      setTab("historico")
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao realizar saque")
    } finally {
      setSaving(false)
    }
  }

  const handleTransferencia = async () => {
    setSaving(true)
    try {
      await transferencia({
        cartaoNumeroDestino: fTransferencia.cartaoNumeroDestino,
        valor: Number(fTransferencia.valor),
      })
      toast.success("Transferência realizada!")
      setFTransferencia({ cartaoNumeroDestino: "", valor: "" })
      load()
      setTab("historico")
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao realizar transferência")
    } finally {
      setSaving(false)
    }
  }

  const handleEmprestimo = async () => {
    setSaving(true)
    try {
      await solicitarEmprestimo({
        cartaoNumero: fEmprestimo.cartaoNumero,
        valor: Number(fEmprestimo.valor),
        parcelas: Number(fEmprestimo.parcelas),
      })
      toast.success("Empréstimo solicitado! Aguarde a aprovação.")
      setFEmprestimo({ cartaoNumero: "", valor: "", parcelas: "" })
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao solicitar empréstimo")
    } finally {
      setSaving(false)
    }
  }

  const tipoBadge = (tipo: string) => {
    const map: any = {
      DEPOSITO: "badge-green",
      SAQUE: "badge-red",
      TRANSFERENCIA: "badge-blue",
      EMPRESTIMO_LIBERADO: "badge-green",
    }
    return map[tipo] ?? "badge-yellow"
  }

  const statusBadge = (s: string) => {
    const map: any = { pendente: "badge-yellow", ativo: "badge-green", rejeitado: "badge-red" }
    return map[s] ?? "badge-yellow"
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Transações</div>
          <div className="page-subtitle">Operações da sua conta</div>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          {(["historico", "saque", "transferencia", "emprestimo"] as const).map((t) => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {
                {
                  historico: "📋 Histórico",
                  saque: "⬆ Saque",
                  transferencia: "↔ Transferência",
                  emprestimo: "◆ Empréstimo",
                }[t]
              }
            </button>
          ))}
        </div>

        {tab === "historico" && (
          <div className="card">
            <div className="table-wrap">
              {transacoes.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">Nenhuma transação registrada</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Descrição</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((t) => (
                      <tr key={t.id}>
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
        )}

        {tab === "saque" && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-header">
              <span className="card-title">Realizar Saque</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-grid">
                <div className="field col-span-2">
                  <label>Cartão de débito</label>
                  <select
                    value={fSaque.cartaoNumero}
                    onChange={(e) => setFSaque((p) => ({ ...p, cartaoNumero: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {cartoesDebito.map((c) => (
                      <option key={c.id} value={c.numero}>
                        {c.numero}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field col-span-2">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={fSaque.valor}
                    onChange={(e) => setFSaque((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16, width: "100%" }}
                onClick={handleSaque}
                disabled={saving}
              >
                {saving ? "Processando..." : "Confirmar Saque"}
              </button>
            </div>
          </div>
        )}

        {tab === "transferencia" && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-header">
              <span className="card-title">Realizar Transferência</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-grid">
                <div className="field col-span-2">
                  <label>Número do cartão de destino</label>
                  <input
                    value={fTransferencia.cartaoNumeroDestino}
                    onChange={(e) =>
                      setFTransferencia((p) => ({ ...p, cartaoNumeroDestino: e.target.value }))
                    }
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
                <div className="field col-span-2">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={fTransferencia.valor}
                    onChange={(e) => setFTransferencia((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16, width: "100%" }}
                onClick={handleTransferencia}
                disabled={saving}
              >
                {saving ? "Processando..." : "Confirmar Transferência"}
              </button>
            </div>
          </div>
        )}

        {tab === "emprestimo" && (
          <>
            <div className="card" style={{ maxWidth: 420, marginBottom: 20 }}>
              <div className="card-header">
                <span className="card-title">Solicitar Empréstimo</span>
              </div>
              <div style={{ padding: 20 }}>
                <div className="form-grid">
                  <div className="field col-span-2">
                    <label>Cartão de crédito</label>
                    <select
                      value={fEmprestimo.cartaoNumero}
                      onChange={(e) => setFEmprestimo((p) => ({ ...p, cartaoNumero: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {cartoesCredito.map((c) => (
                        <option key={c.id} value={c.numero}>
                          {c.numero} — limite R$ {Number(c.limite).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Valor (R$)</label>
                    <input
                      type="number"
                      value={fEmprestimo.valor}
                      onChange={(e) => setFEmprestimo((p) => ({ ...p, valor: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="field">
                    <label>Parcelas</label>
                    <input
                      type="number"
                      value={fEmprestimo.parcelas}
                      onChange={(e) => setFEmprestimo((p) => ({ ...p, parcelas: e.target.value }))}
                      placeholder="12"
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16, width: "100%" }}
                  onClick={handleEmprestimo}
                  disabled={saving}
                >
                  {saving ? "Enviando..." : "Solicitar Empréstimo"}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Meus Empréstimos</span>
              </div>
              <div className="table-wrap">
                {emprestimos.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">◆</div>
                    <div className="empty-text">Nenhum empréstimo solicitado</div>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Valor</th>
                        <th>Parcelas</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimos.map((e) => (
                        <tr key={e.id}>
                          <td className="mono" style={{ color: "var(--accent)" }}>
                            R$ {Number(e.valor).toFixed(2)}
                          </td>
                          <td className="mono">{e.parcelas}x</td>
                          <td>
                            <span className={`badge ${statusBadge(e.status)}`}>{e.status}</span>
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
