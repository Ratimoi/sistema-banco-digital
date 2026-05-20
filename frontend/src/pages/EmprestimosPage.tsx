import { useState, useEffect } from "react"
import { getEmprestimos, createEmprestimo, updateEmprestimo, deleteEmprestimo } from "../services/emprestimoService"
import { getClientes } from "../services/clienteService"
import { Modal, Confirm, toast } from "../components/ui"

const empty = { valor: "", taxaJuros: "", parcelas: "", status: "ativo", clienteId: "" }

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const [e, c] = await Promise.all([getEmprestimos(), getClientes()])
      setEmprestimos(e.data); setClientes(c.data)
    } catch { toast.error("Erro ao carregar dados") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (e: any) => {
    setEditing(e)
    setForm({ valor: e.valor, taxaJuros: e.taxaJuros, parcelas: e.parcelas, status: e.status, clienteId: e.clienteId })
    setModal(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const data = { ...form, valor: Number(form.valor), taxaJuros: Number(form.taxaJuros), parcelas: Number(form.parcelas), clienteId: Number(form.clienteId) }
      if (editing) { await updateEmprestimo(editing.id, data); toast.success("Empréstimo atualizado!") }
      else { await createEmprestimo(data); toast.success("Empréstimo criado!") }
      setModal(false); load()
    } catch { toast.error("Erro ao salvar empréstimo") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteEmprestimo(confirmId); toast.success("Empréstimo deletado!")
      setConfirmId(null); load()
    } catch { toast.error("Erro ao deletar empréstimo") }
    finally { setDeleting(false) }
  }

  const f = (k: string) => (e: any) => setForm((prev: any) => ({ ...prev, [k]: e.target.value }))

  const statusBadge = (s: string) => {
    const map: any = { ativo: "badge-green", quitado: "badge-blue", inadimplente: "badge-red" }
    return map[s] ?? "badge-yellow"
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Empréstimos</div>
          <div className="page-subtitle">{emprestimos.length} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Empréstimo</button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : emprestimos.length === 0 ? (
              <div className="empty"><div className="empty-icon">💰</div><div className="empty-text">Nenhum empréstimo cadastrado</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>#</th><th>Valor</th><th>Taxa</th><th>Parcelas</th><th>Status</th><th>Cliente</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {emprestimos.map(e => (
                    <tr key={e.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>{e.id}</td>
                      <td className="mono" style={{ color: "var(--accent)" }}>R$ {Number(e.valor).toFixed(2)}</td>
                      <td className="mono">{e.taxaJuros}%</td>
                      <td className="mono">{e.parcelas}x</td>
                      <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                      <td>{e.cliente?.nome ?? `#${e.clienteId}`}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(e.id)}>Deletar</button>
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
        <Modal title={editing ? "Editar Empréstimo" : "Novo Empréstimo"} onClose={() => setModal(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)} disabled={saving}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </>
        }>
          <div className="form-grid">
            <div className="field">
              <label>Valor (R$)</label>
              <input type="number" value={form.valor} onChange={f("valor")} placeholder="0.00" />
            </div>
            <div className="field">
              <label>Taxa de Juros (%)</label>
              <input type="number" value={form.taxaJuros} onChange={f("taxaJuros")} placeholder="2.5" />
            </div>
            <div className="field">
              <label>Parcelas</label>
              <input type="number" value={form.parcelas} onChange={f("parcelas")} placeholder="12" />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={f("status")}>
                <option value="ativo">Ativo</option>
                <option value="quitado">Quitado</option>
                <option value="inadimplente">Inadimplente</option>
              </select>
            </div>
            <div className="field col-span-2">
              <label>Cliente</label>
              <select value={form.clienteId} onChange={f("clienteId")}>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm message="Deseja deletar este empréstimo?" onConfirm={handleDelete} onClose={() => setConfirmId(null)} loading={deleting} />
      )}
    </>
  )
}
