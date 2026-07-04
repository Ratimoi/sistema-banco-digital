import { useState, FormEvent } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { redefinirSenha } from "../../services/clienteAuthService"
import { toast } from "../../components/ui"

export default function PortalRedefinirSenhaPage() {
  const location = useLocation()
  const emailInicial = (location.state as { email?: string } | null)?.email ?? ""
  const [form, setForm] = useState({ email: emailInicial, codigo: "", novaSenha: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await redefinirSenha(form)
      toast.success("Senha redefinida com sucesso!")
      navigate("/portal/login", { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Código inválido ou expirado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <h1>BANCO</h1>
          <span>Redefinir senha</span>
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={form.email} onChange={f("email")} autoFocus required />
        </div>
        <div className="field">
          <label>Código recebido por e-mail</label>
          <input value={form.codigo} onChange={f("codigo")} placeholder="123456" required />
        </div>
        <div className="field">
          <label>Nova senha</label>
          <input
            type="password"
            value={form.novaSenha}
            onChange={f("novaSenha")}
            placeholder="Mínimo 8 caracteres, com maiúscula, número e símbolo"
            required
          />
        </div>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </button>
        <Link to="/portal/login" style={{ color: "var(--text2)", fontSize: 12, textAlign: "center" }}>
          Voltar ao login
        </Link>
      </form>
    </div>
  )
}
