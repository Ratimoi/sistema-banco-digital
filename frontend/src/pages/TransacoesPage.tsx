import { useState, useEffect, useCallback } from "react"
import { getTransacoes, deposito, saque, transferencia } from "../services/transacaoService"
import { getContas } from "../services/contaService"
import { Pagination, toast } from "../components/ui"
import { Conta, Transacao } from "../types"

export default function TransacoesPage() {
  const [tab, setTab] = useState<"historico" | "deposito" | "saque" | "transferencia">("historico")
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fDeposito, setFDeposito] = useState({ contaId: "", valor: "" })
  const [fSaque, setFSaque] = useState({ contaId: "", valor: "" })
  const [fTransferencia, setFTransferencia] = useState({ origemId: "", destinoId: "", valor: "" })

  const loadTransacoes = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await getTransacoes(page)
      setTransacoes(res.data.dados)
      setTotal(res.data.total)
      setPagina(res.data.pagina)
      setTotalPaginas(res.data.totalPaginas)
    } catch {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTransacoes(1)
    getContas(1, 100)
      .then((res) => setContas(res.data.dados))
      .catch(() => toast.error("Erro ao carregar contas"))
  }, [loadTransacoes])

  const handleDeposito = async () => {
    setSaving(true)
    try {
      await deposito({ contaId: Number(fDeposito.contaId), valor: Number(fDeposito.valor) })
      toast.success("Depósito realizado!")
      setFDeposito({ contaId: "", valor: "" })
      loadTransacoes(1)
      setTab("historico")
    } catch (e) {
      const message = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || "Erro ao realizar depósito")
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
      loadTransacoes(1)
      setTab("historico")
    } catch (e) {
      const message = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || "Erro ao realizar saque")
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
      loadTransacoes(1)
      setTab("historico")
    } catch (e) {
      const message = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || "Erro ao realizar transferência")
    } finally {
      setSaving(false)
    }
  }

  const tipoBadge = (tipo: string) => {
    const map: Record<string, string> = { DEPOSITO: "badge-green", SAQUE: "badge-red", TRANSFERENCIA: "badge-blue" }
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
            <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={loadTransacoes} />
          </div>
        )}

        {tab === "deposito" && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-header">
              <span className="card-title">Realizar Depósito</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-grid">
                <label className="field col-span-2">
                  Conta Destino
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
                </label>
                <label className="field col-span-2">
                  Valor (R$)
                  <input
                    type="number"
                    value={fDeposito.valor}
                    onChange={(e) => setFDeposito((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>
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
                <label className="field col-span-2">
                  Conta Origem
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
                </label>
                <label className="field col-span-2">
                  Valor (R$)
                  <input
                    type="number"
                    value={fSaque.valor}
                    onChange={(e) => setFSaque((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>
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
                <label className="field col-span-2">
                  Conta Origem
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
                </label>
                <label className="field col-span-2">
                  Conta Destino
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
                </label>
                <label className="field col-span-2">
                  Valor (R$)
                  <input
                    type="number"
                    value={fTransferencia.valor}
                    onChange={(e) => setFTransferencia((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>
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
