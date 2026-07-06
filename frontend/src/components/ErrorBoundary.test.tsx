import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ErrorBoundary } from "./ErrorBoundary"

const Bomba = () => {
  throw new Error("erro de teste")
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React e o componentDidCatch logam no console.error — silencia o ruído esperado no teste.
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renderiza os filhos normalmente quando não há erro", () => {
    render(
      <ErrorBoundary>
        <div>conteúdo normal</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText("conteúdo normal")).toBeInTheDocument()
  })

  it("mostra a tela de fallback quando um filho lança um erro no render", () => {
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Recarregar página" })).toBeInTheDocument()
  })

  it("registra o erro no console via componentDidCatch", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    expect(spy).toHaveBeenCalledWith(
      "Erro não tratado na interface:",
      expect.any(Error),
      expect.any(String),
    )
  })

  it("o botão de recarregar chama window.location.reload", async () => {
    const reloadMock = vi.fn()
    const originalLocation = window.location
    // @ts-expect-error jsdom location não é totalmente compatível com o tipo Location
    delete window.location
    // @ts-expect-error mock mínimo só com reload
    window.location = { reload: reloadMock }

    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Recarregar página" }))

    expect(reloadMock).toHaveBeenCalledOnce()
    // @ts-expect-error restaura o location real de volta
    window.location = originalLocation
  })
})
