import { useState, useEffect } from "react"
import { getCartoes, createCartao, updateCartao, deleteCartao } from "../services/cartaoService"
import { getContas } from "../services/contaService"
import { Modal, Confirm, toast } from "../components/ui"

const empty = { numero: "", validade: "", cvv: "", tipo: "credito", contaId: "" }

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<any[]>([])
  const [contas, setContas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const [ca, co] = await Promise.all([getCartoes(), getContas()])
      setCartoes(ca.data); setContas(co.data)
    } catch { toast.error("Erro ao carregar dados") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (c: any) => {
    setEditing(c)
    setForm({ numero: c.numero, validade: c.validade, cvv: c.cvv, tipo: c.tipo, contaId: c.contaId })
    setModal(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const data = { ...form, contaId: Number(form.contaId) }
      if (editing) { await updateCartao(editing.id, data); toast.success("Cartão atualizado!") }
      else { await createCartao(data); toast.success("Cartão criado!") }
      setModal(false); load()
    } catch { toast.error("Erro ao salvar cartão") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteCartao(confirmId); toast.success("Cartão deletado!")
      setConfirmId(null); load()
    } catch { toast.error("Erro ao deletar cartão") }
    finally { setDeleting(false) }
  }

  const f = (k: string) => (e: any) => setForm((prev: any) => ({ ...prev, [k]: e.target.value }))

  const maskCard = (n: string) => n.replace(/\d(?=\d{4})/g, "•")

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Cartões</div>
          <div className="page-subtitle">{cartoes.length} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Cartão</button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : cartoes.length === 0 ? (
              <div className="empty"><div className="empty-icon">💳</div><div className="empty-text">Nenhum cartão cadastrado</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>#</th><th>Número</th><th>Tipo</th><th>Validade</th><th>Conta</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {cartoes.map(c => (
                    <tr key={c.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>{c.id}</td>
                      <td className="mono">{maskCard(c.numero)}</td>
                      <td><span className={`badge ${c.tipo === "credito" ? "badge-green" : "badge-yellow"}`}>{c.tipo}</span></td>
                      <td className="mono">{c.validade}</td>
                      <td className="mono">{c.conta?.numeroConta ?? `#${c.contaId}`}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(c.id)}>Deletar</button>
                        </div>
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
        <Modal title={editing ? "Editar Cartão" : "Novo Cartão"} onClose={() => setModal(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </>
        }>
          <div className="form-grid">
            <div className="field col-span-2">
              <label>Número do Cartão</label>
              <input value={form.numero} onChange={f("numero")} placeholder="0000-0000-0000-0000" />
            </div>
            <div className="field">
              <label>Validade</label>
              <input value={form.validade} onChange={f("validade")} placeholder="MM/AA" />
            </div>
            <div className="field">
              <label>CVV</label>
              <input value={form.cvv} onChange={f("cvv")} placeholder="123" maxLength={4} />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={f("tipo")}>
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
              </select>
            </div>
            <div className="field">
              <label>Conta</label>
              <select value={form.contaId} onChange={f("contaId")}>
                <option value="">Selecione...</option>
                {contas.map(c => <option key={c.id} value={c.id}>{c.numeroConta}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm message="Deseja deletar este cartão?" onConfirm={handleDelete} onClose={() => setConfirmId(null)} loading={deleting} />
      )}
    </>
  )
}
