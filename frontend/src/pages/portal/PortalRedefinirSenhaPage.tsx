import { useState, FormEvent } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { redefinirSenha } from "../../services/authService"
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
      navigate("/login", { replace: true })
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
          <h1>TEENBANK</h1>
          <span>Redefinir senha</span>
        </div>
        <label className="field">
          E-mail
          <input type="email" value={form.email} onChange={f("email")} autoFocus required />
        </label>
        <label className="field">
          Código recebido por e-mail
          <input value={form.codigo} onChange={f("codigo")} placeholder="123456" required />
        </label>
        <label className="field">
          Nova senha
          <input
            type="password"
            value={form.novaSenha}
            onChange={f("novaSenha")}
            placeholder="Mínimo 8 caracteres, com maiúscula, número e símbolo"
            required
          />
        </label>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </button>
        <Link to="/login" style={{ color: "var(--text2)", fontSize: 12, textAlign: "center" }}>
          Voltar ao login
        </Link>
      </form>
    </div>
  )
}
