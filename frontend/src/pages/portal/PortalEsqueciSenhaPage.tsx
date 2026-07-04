import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { esqueciSenha } from "../../services/authService"
import { toast } from "../../components/ui"

export default function PortalEsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await esqueciSenha(email)
      toast.success("Se o e-mail estiver cadastrado, um código foi enviado.")
      navigate("/redefinir-senha", { replace: true, state: { email } })
    } catch {
      toast.error("Erro ao solicitar recuperação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <h1>BANCO</h1>
          <span>Recuperar senha</span>
        </div>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoFocus
            required
          />
        </div>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar código"}
        </button>
        <Link to="/login" style={{ color: "var(--text2)", fontSize: 12, textAlign: "center" }}>
          Voltar ao login
        </Link>
      </form>
    </div>
  )
}
