import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login, setToken, setRefreshToken, setNivel } from "../services/authService"
import { toast } from "../components/ui"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(email, senha)
      setToken(data.token)
      setRefreshToken(data.refreshToken)
      setNivel(data.cliente.nivel)
      navigate(data.cliente.nivel > 0 ? "/admin" : "/portal", { replace: true })
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
          <h1>TEENBANK</h1>
          <span>Sistema Bancário Digital</span>
        </div>
        <label className="field">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoFocus
            required
          />
        </label>
        <label className="field">
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <Link to="/cadastro" style={{ color: "var(--text2)" }}>
            Criar conta
          </Link>
          <Link to="/esqueci-senha" style={{ color: "var(--text2)" }}>
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  )
}
