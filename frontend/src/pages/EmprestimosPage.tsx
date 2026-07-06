import { useState, useEffect } from "react"
import {
  getEmprestimos,
  createEmprestimo,
  updateEmprestimo,
  deleteEmprestimo,
  aprovarEmprestimo,
  rejeitarEmprestimo,
  EmprestimoInput,
} from "../services/emprestimoService"
import { getClientes } from "../services/clienteService"
import { Modal, Confirm, Pagination, toast } from "../components/ui"
import { useCrudPage } from "../hooks/useCrudPage"
import { Cliente, Emprestimo } from "../types"

interface EmprestimoForm {
  valor: string
  taxaJuros: string
  parcelas: string
  status: string
  clienteId: string
}

const empty: EmprestimoForm = { valor: "", taxaJuros: "", parcelas: "", status: "ativo", clienteId: "" }

const buildPayload = (form: EmprestimoForm): EmprestimoInput => ({
  valor: Number(form.valor),
  taxaJuros: Number(form.taxaJuros),
  parcelas: Number(form.parcelas),
  status: form.status,
  clienteId: Number(form.clienteId),
})

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pendente: "badge-yellow",
    ativo: "badge-green",
    rejeitado: "badge-red",
    quitado: "badge-blue",
    inadimplente: "badge-red",
  }
  return map[s] ?? "badge-yellow"
}

export default function EmprestimosPage() {
  const {
    dados: emprestimos,
    total,
    pagina,
    totalPaginas,
    loading,
    modal,
    setModal,
    editing,
    form,
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
  } = useCrudPage<Emprestimo, EmprestimoForm, EmprestimoInput>({
    fetchPage: getEmprestimos,
    create: createEmprestimo,
    update: updateEmprestimo,
    remove: deleteEmprestimo,
    emptyForm: empty,
    toEditForm: (e) => ({
      valor: e.valor,
      taxaJuros: e.taxaJuros,
      parcelas: String(e.parcelas),
      status: e.status,
      clienteId: String(e.clienteId),
    }),
    buildPayload,
    messages: {
      created: "Empréstimo criado!",
      updated: "Empréstimo atualizado!",
      deleted: "Empréstimo deletado!",
      loadError: "Erro ao carregar dados",
      saveError: "Erro ao salvar empréstimo",
      deleteError: "Erro ao deletar empréstimo",
    },
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [processandoId, setProcessandoId] = useState<number | null>(null)

  useEffect(() => {
    getClientes(1, 100)
      .then((res) => setClientes(res.data.dados))
      .catch(() => toast.error("Erro ao carregar clientes"))
  }, [])

  const handleAprovar = async (id: number) => {
    setProcessandoId(id)
    try {
      await aprovarEmprestimo(id)
      toast.success("Empréstimo aprovado!")
      changePage(pagina)
    } catch (e) {
      const message = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || "Erro ao aprovar empréstimo")
    } finally {
      setProcessandoId(null)
    }
  }

  const handleRejeitar = async (id: number) => {
    setProcessandoId(id)
    try {
      await rejeitarEmprestimo(id)
      toast.success("Empréstimo rejeitado!")
      changePage(pagina)
    } catch (e) {
      const message = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || "Erro ao rejeitar empréstimo")
    } finally {
      setProcessandoId(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Empréstimos</div>
          <div className="page-subtitle">{total} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Empréstimo
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : emprestimos.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💰</div>
                <div className="empty-text">Nenhum empréstimo cadastrado</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Valor</th>
                    <th>Taxa</th>
                    <th>Parcelas</th>
                    <th>Status</th>
                    <th>Cliente</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emprestimos.map((e) => (
                    <tr key={e.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>
                        {e.id}
                      </td>
                      <td className="mono" style={{ color: "var(--accent)" }}>
                        R$ {Number(e.valor).toFixed(2)}
                      </td>
                      <td className="mono">{e.taxaJuros}%</td>
                      <td className="mono">{e.parcelas}x</td>
                      <td>
                        <span className={`badge ${statusBadge(e.status)}`}>{e.status}</span>
                      </td>
                      <td>{e.cliente?.nome ?? `#${e.clienteId}`}</td>
                      <td>
                        <div className="actions">
                          {e.status === "pendente" && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleAprovar(e.id)}
                                disabled={processandoId === e.id}
                                style={{ color: "var(--accent)" }}
                              >
                                Aprovar
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRejeitar(e.id)}
                                disabled={processandoId === e.id}
                                style={{ color: "var(--red)" }}
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(e.id)}>
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
          title={editing ? "Editar Empréstimo" : "Novo Empréstimo"}
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
            <label className="field">
              Valor (R$)
              <input type="number" value={form.valor} onChange={f("valor")} placeholder="0.00" />
            </label>
            <label className="field">
              Taxa de Juros (%)
              <input type="number" value={form.taxaJuros} onChange={f("taxaJuros")} placeholder="2.5" />
            </label>
            <label className="field">
              Parcelas
              <input type="number" value={form.parcelas} onChange={f("parcelas")} placeholder="12" />
            </label>
            <label className="field">
              Status
              <select value={form.status} onChange={f("status")}>
                <option value="pendente">Pendente</option>
                <option value="ativo">Ativo</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="quitado">Quitado</option>
                <option value="inadimplente">Inadimplente</option>
              </select>
            </label>
            <label className="field col-span-2">
              Cliente
              <select value={form.clienteId} onChange={f("clienteId")}>
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm
          message="Deseja deletar este empréstimo?"
          onConfirm={handleDelete}
          onClose={() => setConfirmId(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
