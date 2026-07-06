import { useState, useEffect } from "react"
import { getCartoes, createCartao, updateCartao, deleteCartao, CartaoInput } from "../services/cartaoService"
import { getContas } from "../services/contaService"
import { Modal, Confirm, Pagination, toast } from "../components/ui"
import { useCrudPage } from "../hooks/useCrudPage"
import { Cartao, Conta } from "../types"
import { somenteDigitos, formatarNumeroCartao, formatarValidade } from "../utils/inputMask"

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

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, numero: formatarNumeroCartao(e.target.value) }))

  const handleValidadeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, validade: formatarValidade(e.target.value) }))

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, cvv: somenteDigitos(e.target.value, 4) }))

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
            <label className="field col-span-2">
              Número do Cartão
              <input
                value={form.numero}
                onChange={handleNumeroChange}
                placeholder="0000-0000-0000-0000"
                inputMode="numeric"
                maxLength={19}
              />
            </label>
            <label className="field">
              Validade
              <input
                value={form.validade}
                onChange={handleValidadeChange}
                placeholder="MM/AA"
                inputMode="numeric"
                maxLength={5}
              />
            </label>
            <label className="field">
              CVV
              <input
                value={form.cvv}
                onChange={handleCvvChange}
                placeholder="123"
                inputMode="numeric"
                maxLength={4}
              />
            </label>
            <label className="field">
              Tipo
              <select value={form.tipo} onChange={f("tipo")}>
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
              </select>
            </label>
            <label className="field">
              Limite (R$)
              <input type="number" value={form.limite} onChange={f("limite")} placeholder="1000.00" />
            </label>
            <label className="field">
              Conta
              <select value={form.contaId} onChange={f("contaId")}>
                <option value="">Selecione...</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numeroConta}
                  </option>
                ))}
              </select>
            </label>
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
