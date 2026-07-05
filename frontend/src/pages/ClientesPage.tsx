import { useState } from "react"
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  enviarEmail,
  ClienteInput,
} from "../services/clienteService"
import { Modal, Confirm, Pagination, toast } from "../components/ui"
import { useCrudPage } from "../hooks/useCrudPage"
import { Cliente } from "../types"
import { somenteDigitos } from "../utils/inputMask"

interface ClienteForm {
  nome: string
  cpf: string
  email: string
  senha: string
  nivel: string
}

const empty: ClienteForm = { nome: "", cpf: "", email: "", senha: "", nivel: "0" }

const buildPayload = (form: ClienteForm, editing: Cliente | null): ClienteInput => {
  const base = { nome: form.nome, cpf: form.cpf, email: form.email, nivel: Number(form.nivel) }
  // Senha em branco significa "não alterar" — o backend rejeita uma senha vazia
  // (mínimo 8 caracteres fortes), então ela só é enviada se preenchida.
  if (editing && !form.senha) return base
  return { ...base, senha: form.senha }
}

export default function ClientesPage() {
  const {
    dados: clientes,
    total,
    pagina,
    totalPaginas,
    loading,
    modal,
    setModal,
    editing,
    form,
    setForm,
    saving,
    confirmId,
    setConfirmId,
    deleting,
    changePage,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    f,
  } = useCrudPage<Cliente, ClienteForm, ClienteInput>({
    fetchPage: getClientes,
    create: createCliente,
    update: updateCliente,
    remove: deleteCliente,
    emptyForm: empty,
    toEditForm: (c) => ({ nome: c.nome, cpf: c.cpf, email: c.email, senha: "", nivel: String(c.nivel ?? 0) }),
    buildPayload,
    messages: {
      created: "Cliente criado!",
      updated: "Cliente atualizado!",
      deleted: "Cliente deletado!",
      loadError: "Erro ao carregar clientes",
      saveError: "Erro ao salvar cliente",
      deleteError: "Erro ao deletar cliente",
    },
  })

  const [emailLoading, setEmailLoading] = useState<number | null>(null)

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, cpf: somenteDigitos(e.target.value, 11) }))

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

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-subtitle">{total} registros</div>
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
                    <th>Conta</th>
                    <th>Nível</th>
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
                        {c.conta ? (
                          <span className="badge badge-blue mono">{c.conta.numeroConta}</span>
                        ) : (
                          <span style={{ color: "var(--text3)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {c.nivel > 0 ? (
                          <span className="badge badge-green">Equipe · nível {c.nivel}</span>
                        ) : (
                          <span style={{ color: "var(--text3)" }}>Cliente</span>
                        )}
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
          <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={changePage} />
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
              <input
                value={form.cpf}
                onChange={handleCpfChange}
                placeholder="00000000000"
                inputMode="numeric"
                maxLength={11}
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <input
                type="password"
                value={form.senha}
                onChange={f("senha")}
                placeholder="Mínimo 8 caracteres, com maiúscula, número e símbolo"
              />
            </div>
            <div className="field col-span-2">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="email@exemplo.com" />
            </div>
            <div className="field col-span-2">
              <label>Nível (credencial especial)</label>
              <select value={form.nivel} onChange={f("nivel")}>
                <option value="0">Cliente comum</option>
                <option value="1">Equipe · nível 1</option>
                <option value="2">Equipe · nível 2</option>
                <option value="3">Equipe · nível 3</option>
              </select>
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
