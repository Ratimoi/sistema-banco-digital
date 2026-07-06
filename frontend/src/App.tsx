import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom"
import { ToastContainer } from "./components/ui"
import { isAuthenticated, getNivel, clearToken, clearRefreshToken, clearNivel } from "./services/authService"
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

interface NavItem {
  to: string
  label: string
  icon: string
}

// Sidebar compartilhada pelo admin e pelo portal do cliente: em telas estreitas ela vira uma
// gaveta (drawer) aberta por um botão hambúrguer, em vez de ficar sempre visível.
function SidebarLayout({
  title,
  subtitle,
  navItems,
  exactPath,
  onLogout,
  children,
}: {
  title: string
  subtitle: string
  navItems: NavItem[]
  exactPath: string
  onLogout: () => void
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout">
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
      >
        {menuOpen ? "✕" : "☰"}
      </button>
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === exactPath}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ marginTop: "auto", border: "none", background: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon">⏻</span>
          Sair
        </button>
      </aside>

      <main className="main">{children}</main>
    </div>
  )
}

const portalNavItems: NavItem[] = [
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
    clearRefreshToken()
    clearNivel()
    navigate("/login", { replace: true })
  }

  return (
    <SidebarLayout
      title="BANCO"
      subtitle="Portal do Cliente"
      navItems={portalNavItems}
      exactPath="/portal"
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<PortalContaCartoesPage />} />
        <Route path="/transacoes" element={<PortalTransacoesPage />} />
        <Route path="/comunidade" element={<PortalComunidadePage />} />
      </Routes>
    </SidebarLayout>
  )
}

const navItems: NavItem[] = [
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
    clearRefreshToken()
    clearNivel()
    navigate("/login", { replace: true })
  }

  return (
    <SidebarLayout
      title="BANCO"
      subtitle="Sistema de Gestão"
      navItems={navItems}
      exactPath="/admin"
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/contas" element={<ContasPage />} />
        <Route path="/cartoes" element={<CartoesPage />} />
        <Route path="/emprestimos" element={<EmprestimosPage />} />
        <Route path="/transacoes" element={<TransacoesPage />} />
        <Route path="/comunidade" element={<ComunidadePage />} />
      </Routes>
    </SidebarLayout>
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
