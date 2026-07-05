import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { cadastro } from "../../services/authService"
import { toast } from "../../components/ui"

const empty = { nome: "", cpf: "", email: "", senha: "", tipoConta: "corrente" }

export default function PortalCadastroPage() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cadastro(form)
      toast.success("Cadastro realizado! Faça login para continuar.")
      navigate("/login", { replace: true })
    } catch (err: any) {
      const details = err.response?.data?.details as { message: string }[] | undefined
      const mensagem = details?.length
        ? details.map((d) => d.message).join(" • ")
        : err.response?.data?.error || "Erro ao criar cadastro"
      toast.error(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="auth-logo">
          <h1>BANCO</h1>
          <span>Criar conta</span>
        </div>
        <div className="field">
          <label>Nome completo</label>
          <input value={form.nome} onChange={f("nome")} placeholder="Seu nome" autoFocus required />
        </div>
        <div className="field">
          <label>CPF</label>
          <input value={form.cpf} onChange={f("cpf")} placeholder="00000000000" required />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={f("email")}
            placeholder="voce@email.com"
            required
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            value={form.senha}
            onChange={f("senha")}
            placeholder="Mínimo 8 caracteres, com maiúscula, número e símbolo"
            required
          />
        </div>
        <div className="field">
          <label>Tipo de conta</label>
          <select value={form.tipoConta} onChange={f("tipoConta")}>
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
          </select>
        </div>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
        <Link to="/login" style={{ color: "var(--text2)", fontSize: 12, textAlign: "center" }}>
          Já tenho conta
        </Link>
      </form>
    </div>
  )
}
