import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login, setClienteToken } from "../../services/clienteAuthService"
import { toast } from "../../components/ui"

export default function PortalLoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(email, senha)
      setClienteToken(data.token)
      navigate("/portal", { replace: true })
    } catch {
      toast.error("E-mail ou senha inválidos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <h1>BANCO</h1>
          <span>Portal do Cliente</span>
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
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <Link to="/portal/cadastro" style={{ color: "var(--text2)" }}>
            Criar conta
          </Link>
          <Link to="/portal/esqueci-senha" style={{ color: "var(--text2)" }}>
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  )
}
