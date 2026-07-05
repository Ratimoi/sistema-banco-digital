import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom"
import { ToastContainer } from "./components/ui"
import { isAuthenticated, getNivel, clearToken, clearNivel } from "./services/authService"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ClientesPage from "./pages/ClientesPage"
import ContasPage from "./pages/ContasPage"
import CartoesPage from "./pages/CartoesPage"
import EmprestimosPage from "./pages/EmprestimosPage"
import TransacoesPage from "./pages/TransacoesPage"
import ComunidadePage from "./pages/ComunidadePage"
import PortalCadastroPage from "./pages/portal/PortalCadastroPage"
import PortalEsqueciSenhaPage from "./pages/portal/PortalEsqueciSenhaPage"
import PortalRedefinirSenhaPage from "./pages/portal/PortalRedefinirSenhaPage"
import PortalContaCartoesPage from "./pages/portal/PortalContaCartoesPage"
import PortalTransacoesPage from "./pages/portal/PortalTransacoesPage"
import PortalComunidadePage from "./pages/portal/PortalComunidadePage"

const portalNavItems = [
  { to: "/portal", label: "Minha Conta", icon: "▣" },
  { to: "/portal/transacoes", label: "Transações", icon: "⇄" },
  { to: "/portal/comunidade", label: "Comunidade", icon: "💬" },
]

function RequireClienteAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PortalLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    clearNivel()
    navigate("/login", { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>BANCO</h1>
          <span>Portal do Cliente</span>
        </div>
        {portalNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/portal"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ marginTop: "auto", border: "none", background: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon">⏻</span>
          Sair
        </button>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<PortalContaCartoesPage />} />
          <Route path="/transacoes" element={<PortalTransacoesPage />} />
          <Route path="/comunidade" element={<PortalComunidadePage />} />
        </Routes>
      </main>
    </div>
  )
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "◈" },
  { to: "/admin/clientes", label: "Clientes", icon: "◉" },
  { to: "/admin/contas", label: "Contas", icon: "▣" },
  { to: "/admin/cartoes", label: "Cartões", icon: "▤" },
  { to: "/admin/emprestimos", label: "Empréstimos", icon: "◆" },
  { to: "/admin/transacoes", label: "Transações", icon: "⇄" },
  { to: "/admin/comunidade", label: "Comunidade", icon: "💬" },
]

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (getNivel() <= 0) return <Navigate to="/portal" replace />
  return <>{children}</>
}

function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    clearNivel()
    navigate("/login", { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>BANCO</h1>
          <span>Sistema de Gestão</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ marginTop: "auto", border: "none", background: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon">⏻</span>
          Sair
        </button>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contas" element={<ContasPage />} />
          <Route path="/cartoes" element={<CartoesPage />} />
          <Route path="/emprestimos" element={<EmprestimosPage />} />
          <Route path="/transacoes" element={<TransacoesPage />} />
          <Route path="/comunidade" element={<ComunidadePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<PortalCadastroPage />} />
        <Route path="/esqueci-senha" element={<PortalEsqueciSenhaPage />} />
        <Route path="/redefinir-senha" element={<PortalRedefinirSenhaPage />} />
        <Route
          path="/portal/*"
          element={
            <RequireClienteAuth>
              <PortalLayout />
            </RequireClienteAuth>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
