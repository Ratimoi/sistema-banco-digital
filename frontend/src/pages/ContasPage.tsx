import { useState, useEffect } from "react"
import { getContas, createConta, updateConta, deleteConta } from "../services/contaService"
import { getClientes } from "../services/clienteService"
import { Modal, Confirm, toast } from "../components/ui"

const empty = { numeroConta: "", tipo: "corrente", saldo: 0, clienteId: "" }

export default function ContasPage() {
  const [contas, setContas] = useState<any[]>([])
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
      const [c, cl] = await Promise.all([getContas(), getClientes()])
      setContas(c.data)
      setClientes(cl.data)
    } catch {
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setModal(true)
  }
  const openEdit = (c: any) => {
    setEditing(c)
    setForm({ numeroConta: c.numeroConta, tipo: c.tipo, saldo: c.saldo, clienteId: c.clienteId })
    setModal(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const data = { ...form, saldo: Number(form.saldo), clienteId: Number(form.clienteId) }
      if (editing) {
        await updateConta(editing.id, data)
        toast.success("Conta atualizada!")
      } else {
        await createConta(data)
        toast.success("Conta criada!")
      }
      setModal(false)
      load()
    } catch {
      toast.error("Erro ao salvar conta")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteConta(confirmId)
      toast.success("Conta deletada!")
      setConfirmId(null)
      load()
    } catch {
      toast.error("Erro ao deletar conta")
    } finally {
      setDeleting(false)
    }
  }

  const f = (k: string) => (e: any) => setForm((prev: any) => ({ ...prev, [k]: e.target.value }))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Contas</div>
          <div className="page-subtitle">{contas.length} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nova Conta
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : contas.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🏦</div>
                <div className="empty-text">Nenhuma conta cadastrada</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Saldo</th>
                    <th>Cliente</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((c) => (
                    <tr key={c.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>
                        {c.id}
                      </td>
                      <td className="mono" style={{ fontWeight: 500 }}>
                        {c.numeroConta}
                      </td>
                      <td>
                        <span className={`badge ${c.tipo === "corrente" ? "badge-blue" : "badge-yellow"}`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td className="mono" style={{ color: c.saldo >= 0 ? "var(--accent)" : "var(--red)" }}>
                        R$ {Number(c.saldo).toFixed(2)}
                      </td>
                      <td>{c.cliente?.nome ?? `#${c.clienteId}`}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(c.id)}>
                            Deletar
                          </button>
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
        <Modal
          title={editing ? "Editar Conta" : "Nova Conta"}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="field">
              <label>Número da Conta</label>
              <input value={form.numeroConta} onChange={f("numeroConta")} placeholder="1001" />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={f("tipo")}>
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>
            <div className="field">
              <label>Saldo Inicial (R$)</label>
              <input type="number" value={form.saldo} onChange={f("saldo")} placeholder="0.00" />
            </div>
            <div className="field">
              <label>Cliente</label>
              <select value={form.clienteId} onChange={f("clienteId")}>
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm
          message={
            <>
              Deseja deletar esta conta? <strong>Todos os dados relacionados serão removidos.</strong>
            </>
          }
          onConfirm={handleDelete}
          onClose={() => setConfirmId(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
