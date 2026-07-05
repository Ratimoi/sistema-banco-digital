import { useState, useEffect } from "react"
import { getMinhaConta } from "../../services/clienteContaService"
import { getMeusCartoes, criarCartao } from "../../services/clienteCartaoService"
import { Modal, toast } from "../../components/ui"

const empty = { tipo: "debito", limite: "" }

export default function PortalContaCartoesPage() {
  const [conta, setConta] = useState<any>(null)
  const [cartoes, setCartoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [c, cart] = await Promise.all([getMinhaConta(), getMeusCartoes()])
      setConta(c.data)
      setCartoes(cart.data)
    } catch {
      toast.error("Erro ao carregar dados da conta")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const maskCard = (n: string) => n.replace(/\d(?=\d{4})/g, "•")

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await criarCartao({ tipo: form.tipo, limite: Number(form.limite) })
      toast.success("Cartão criado!")
      setModal(false)
      setForm(empty)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao criar cartão")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Minha Conta</div>
          <div className="page-subtitle">Conta e cartões</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Novo Cartão
        </button>
      </div>

      <div className="page-content">
        <div className="stats-grid stats-grid-3">
          <div className="stat-card">
            <div className="stat-label">Número da conta</div>
            <div className="stat-value mono" style={{ fontSize: 20 }}>
              {conta?.numeroConta}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tipo</div>
            <div className="stat-value stat-blue" style={{ fontSize: 20 }}>
              {conta?.tipo}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Saldo</div>
            <div className="stat-value stat-green">R$ {Number(conta?.saldo ?? 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Meus Cartões</span>
          </div>
          <div className="table-wrap">
            {cartoes.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💳</div>
                <div className="empty-text">Nenhum cartão cadastrado</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Validade</th>
                    <th>Limite</th>
                  </tr>
                </thead>
                <tbody>
                  {cartoes.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{maskCard(c.numero)}</td>
                      <td>
                        <span className={`badge ${c.tipo === "credito" ? "badge-green" : "badge-yellow"}`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td className="mono">{c.validade}</td>
                      <td className="mono" style={{ color: "var(--accent)" }}>
                        R$ {Number(c.limite).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          title="Novo Cartão"
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Criando..." : "Criar"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={f("tipo")}>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            <div className="field">
              <label>Limite (R$)</label>
              <input type="number" value={form.limite} onChange={f("limite")} placeholder="1000.00" />
            </div>
            <p className="col-span-2" style={{ color: "var(--text2)", fontSize: 12, margin: 0 }}>
              Para solicitar um empréstimo mais tarde, você precisa de um cartão de{" "}
              <strong>crédito</strong> — saques e transferências usam o cartão de débito.
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}
