import { useState, useEffect } from "react"
import { getTransacoes, deposito, saque, transferencia } from "../services/transacaoService"
import { getContas } from "../services/contaService"
import { toast } from "../components/ui"

export default function TransacoesPage() {
  const [tab, setTab] = useState<"historico" | "deposito" | "saque" | "transferencia">("historico")
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [contas, setContas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fDeposito, setFDeposito] = useState({ contaId: "", valor: "" })
  const [fSaque, setFSaque] = useState({ contaId: "", valor: "" })
  const [fTransferencia, setFTransferencia] = useState({ origemId: "", destinoId: "", valor: "" })

  const load = async () => {
    try {
      const [t, c] = await Promise.all([getTransacoes(), getContas()])
      setTransacoes(t.data)
      setContas(c.data)
    } catch {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDeposito = async () => {
    setSaving(true)
    try {
      await deposito({ contaId: Number(fDeposito.contaId), valor: Number(fDeposito.valor) })
      toast.success("Depósito realizado!")
      setFDeposito({ contaId: "", valor: "" })
      load()
      setTab("historico")
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao realizar depósito")
    } finally {
      setSaving(false)
    }
  }

  const handleSaque = async () => {
    setSaving(true)
    try {
      await saque({ contaId: Number(fSaque.contaId), valor: Number(fSaque.valor) })
      toast.success("Saque realizado!")
      setFSaque({ contaId: "", valor: "" })
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
        origemId: Number(fTransferencia.origemId),
        destinoId: Number(fTransferencia.destinoId),
        valor: Number(fTransferencia.valor),
      })
      toast.success("Transferência realizada!")
      setFTransferencia({ origemId: "", destinoId: "", valor: "" })
      load()
      setTab("historico")
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao realizar transferência")
    } finally {
      setSaving(false)
    }
  }

  const tipoBadge = (tipo: string) => {
    const map: any = { DEPOSITO: "badge-green", SAQUE: "badge-red", TRANSFERENCIA: "badge-blue" }
    return map[tipo] ?? "badge-yellow"
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Transações</div>
          <div className="page-subtitle">Operações bancárias</div>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          {(["historico", "deposito", "saque", "transferencia"] as const).map((t) => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {
                {
                  historico: "📋 Histórico",
                  deposito: "⬇ Depósito",
                  saque: "⬆ Saque",
                  transferencia: "↔ Transferência",
                }[t]
              }
            </button>
          ))}
        </div>

        {tab === "historico" && (
          <div className="card">
            <div className="table-wrap">
              {loading ? (
                <div className="loading">Carregando...</div>
              ) : transacoes.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">Nenhuma transação registrada</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Descrição</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((t) => (
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
                        <td className="mono">{t.contaOrigem?.numeroConta ?? "—"}</td>
                        <td className="mono">{t.contaDestino?.numeroConta ?? "—"}</td>
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

        {tab === "deposito" && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-header">
              <span className="card-title">Realizar Depósito</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-grid">
                <div className="field col-span-2">
                  <label>Conta Destino</label>
                  <select
                    value={fDeposito.contaId}
                    onChange={(e) => setFDeposito((p) => ({ ...p, contaId: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numeroConta} — R$ {Number(c.saldo).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field col-span-2">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={fDeposito.valor}
                    onChange={(e) => setFDeposito((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16, width: "100%" }}
                onClick={handleDeposito}
                disabled={saving}
              >
                {saving ? "Processando..." : "Confirmar Depósito"}
              </button>
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
                  <label>Conta Origem</label>
                  <select
                    value={fSaque.contaId}
                    onChange={(e) => setFSaque((p) => ({ ...p, contaId: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numeroConta} — R$ {Number(c.saldo).toFixed(2)}
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
                  <label>Conta Origem</label>
                  <select
                    value={fTransferencia.origemId}
                    onChange={(e) => setFTransferencia((p) => ({ ...p, origemId: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numeroConta} — R$ {Number(c.saldo).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field col-span-2">
                  <label>Conta Destino</label>
                  <select
                    value={fTransferencia.destinoId}
                    onChange={(e) => setFTransferencia((p) => ({ ...p, destinoId: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {contas
                      .filter((c) => c.id !== Number(fTransferencia.origemId))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numeroConta} — R$ {Number(c.saldo).toFixed(2)}
                        </option>
                      ))}
                  </select>
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
      </div>
    </>
  )
}
