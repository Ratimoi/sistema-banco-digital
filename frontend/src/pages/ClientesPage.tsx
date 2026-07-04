import { useState, useEffect } from "react"
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  enviarEmail,
} from "../services/clienteService"
import { Modal, Confirm, toast } from "../components/ui"

const empty = { nome: "", cpf: "", email: "", senha: "" }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [emailLoading, setEmailLoading] = useState<number | null>(null)

  const load = async () => {
    try {
      const res = await getClientes()
      setClientes(res.data)
    } catch {
      toast.error("Erro ao carregar clientes")
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
    setForm({ nome: c.nome, cpf: c.cpf, email: c.email, senha: "" })
    setModal(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (editing) {
        // Senha em branco significa "não alterar" — o backend rejeita uma senha
        // vazia (mínimo 6 caracteres), então ela só é enviada se preenchida.
        const { senha, ...rest } = form
        await updateCliente(editing.id, senha ? form : rest)
        toast.success("Cliente atualizado!")
      } else {
        await createCliente(form)
        toast.success("Cliente criado!")
      }
      setModal(false)
      load()
    } catch {
      toast.error("Erro ao salvar cliente")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteCliente(confirmId)
      toast.success("Cliente deletado!")
      setConfirmId(null)
      load()
    } catch {
      toast.error("Erro ao deletar cliente")
    } finally {
      setDeleting(false)
    }
  }

  const handleEmail = async (id: number) => {
    setEmailLoading(id)
    try {
      await enviarEmail(id)
      toast.success("E-mail enviado!")
    } catch {
      toast.error("Erro ao enviar e-mail")
    } finally {
      setEmailLoading(null)
    }
  }

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-subtitle">{clientes.length} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Cliente
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : clientes.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👤</div>
                <div className="empty-text">Nenhum cliente cadastrado</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>E-mail</th>
                    <th>Contas</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>
                        {c.id}
                      </td>
                      <td style={{ fontWeight: 500 }}>{c.nome}</td>
                      <td className="mono">{c.cpf}</td>
                      <td className="mono">{c.email}</td>
                      <td>
                        <span className="badge badge-blue">{c.contas?.length ?? 0}</span>
                      </td>
                      <td className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEmail(c.id)}
                            disabled={emailLoading === c.id}
                          >
                            {emailLoading === c.id ? "..." : "✉"}
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
          title={editing ? "Editar Cliente" : "Novo Cliente"}
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
            <div className="field col-span-2">
              <label>Nome</label>
              <input value={form.nome} onChange={f("nome")} placeholder="Nome completo" />
            </div>
            <div className="field">
              <label>CPF</label>
              <input value={form.cpf} onChange={f("cpf")} placeholder="00000000000" />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={form.senha} onChange={f("senha")} placeholder="••••••" />
            </div>
            <div className="field col-span-2">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="email@exemplo.com" />
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm
          message={
            <>
              Tem certeza que deseja deletar este cliente? <strong>Esta ação não pode ser desfeita.</strong>
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
