import { useState, useEffect } from "react"
import { getContas, createConta, updateConta, deleteConta, ContaInput } from "../services/contaService"
import { getClientes } from "../services/clienteService"
import { getNivel } from "../services/authService"
import { Modal, Confirm, Pagination, toast } from "../components/ui"
import { useCrudPage } from "../hooks/useCrudPage"
import { Cliente, Conta } from "../types"

interface ContaForm {
  numeroConta: string
  tipo: string
  saldo: string
  clienteId: string
}

const empty: ContaForm = { numeroConta: "", tipo: "corrente", saldo: "0", clienteId: "" }

const buildPayload = (form: ContaForm): ContaInput => ({
  numeroConta: form.numeroConta,
  tipo: form.tipo,
  saldo: Number(form.saldo),
  clienteId: Number(form.clienteId),
})

export default function ContasPage() {
  // Só nível 3 define/altera o saldo diretamente — nível 2 cria/edita a conta normalmente, mas o
  // backend ignora esse campo se vier na requisição (fica em 0 na criação, sem mudar na edição).
  const podeEditarSaldo = getNivel() >= 3

  const {
    dados: contas,
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
  } = useCrudPage<Conta, ContaForm, ContaInput>({
    fetchPage: getContas,
    create: createConta,
    update: updateConta,
    remove: deleteConta,
    emptyForm: empty,
    toEditForm: (c) => ({
      numeroConta: c.numeroConta,
      tipo: c.tipo,
      saldo: c.saldo,
      clienteId: String(c.clienteId),
    }),
    buildPayload,
    messages: {
      created: "Conta criada!",
      updated: "Conta atualizada!",
      deleted: "Conta deletada!",
      loadError: "Erro ao carregar dados",
      saveError: "Erro ao salvar conta",
      deleteError: "Erro ao deletar conta",
    },
  })

  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    getClientes(1, 100)
      .then((res) => setClientes(res.data.dados))
      .catch(() => toast.error("Erro ao carregar clientes"))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Contas</div>
          <div className="page-subtitle">{total} registros</div>
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
                      <td className="mono" style={{ color: Number(c.saldo) >= 0 ? "var(--accent)" : "var(--red)" }}>
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
          <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={changePage} />
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
            <label className="field">
              Número da Conta
              <input value={form.numeroConta} onChange={f("numeroConta")} placeholder="1001" />
            </label>
            <label className="field">
              Tipo
              <select value={form.tipo} onChange={f("tipo")}>
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </label>
            {podeEditarSaldo && (
              <label className="field">
                Saldo Inicial (R$)
                <input type="number" value={form.saldo} onChange={f("saldo")} placeholder="0.00" />
              </label>
            )}
            <label className="field">
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
