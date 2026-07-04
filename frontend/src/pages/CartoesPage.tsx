import { useState, useEffect } from "react"
import { getCartoes, createCartao, updateCartao, deleteCartao, CartaoInput } from "../services/cartaoService"
import { getContas } from "../services/contaService"
import { Modal, Confirm, Pagination, toast } from "../components/ui"
import { useCrudPage } from "../hooks/useCrudPage"
import { Cartao, Conta } from "../types"

interface CartaoForm {
  numero: string
  validade: string
  cvv: string
  tipo: string
  limite: string
  contaId: string
}

const empty: CartaoForm = { numero: "", validade: "", cvv: "", tipo: "credito", limite: "", contaId: "" }

const buildPayload = (form: CartaoForm): CartaoInput => ({
  numero: form.numero,
  validade: form.validade,
  cvv: form.cvv,
  tipo: form.tipo,
  limite: Number(form.limite),
  contaId: Number(form.contaId),
})

const maskCard = (n: string) => n.replace(/\d(?=\d{4})/g, "•")

export default function CartoesPage() {
  const {
    dados: cartoes,
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
  } = useCrudPage<Cartao, CartaoForm, CartaoInput>({
    fetchPage: getCartoes,
    create: createCartao,
    update: updateCartao,
    remove: deleteCartao,
    emptyForm: empty,
    toEditForm: (c) => ({
      numero: c.numero,
      validade: c.validade,
      cvv: c.cvv ?? "",
      tipo: c.tipo,
      limite: c.limite,
      contaId: String(c.contaId),
    }),
    buildPayload,
    messages: {
      created: "Cartão criado!",
      updated: "Cartão atualizado!",
      deleted: "Cartão deletado!",
      loadError: "Erro ao carregar dados",
      saveError: "Erro ao salvar cartão",
      deleteError: "Erro ao deletar cartão",
    },
  })

  const [contas, setContas] = useState<Conta[]>([])

  useEffect(() => {
    getContas(1, 100)
      .then((res) => setContas(res.data.dados))
      .catch(() => toast.error("Erro ao carregar contas"))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Cartões</div>
          <div className="page-subtitle">{total} registros</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Novo Cartão
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : cartoes.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💳</div>
                <div className="empty-text">Nenhum cartão cadastrado</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Validade</th>
                    <th>Limite</th>
                    <th>Conta</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cartoes.map((c) => (
                    <tr key={c.id}>
                      <td className="mono" style={{ color: "var(--text3)" }}>
                        {c.id}
                      </td>
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
                      <td className="mono">{c.conta?.numeroConta ?? `#${c.contaId}`}</td>
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
          title={editing ? "Editar Cartão" : "Novo Cartão"}
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
              <label>Limite (R$)</label>
              <input type="number" value={form.limite} onChange={f("limite")} placeholder="1000.00" />
            </div>
            <div className="field">
              <label>Conta</label>
              <select value={form.contaId} onChange={f("contaId")}>
                <option value="">Selecione...</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numeroConta}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm
          message="Deseja deletar este cartão?"
          onConfirm={handleDelete}
          onClose={() => setConfirmId(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
