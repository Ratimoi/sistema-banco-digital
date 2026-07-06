import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PostContent } from "./PostContent"

describe("PostContent", () => {
  it("renderiza texto puro sem links ou menções", () => {
    render(<PostContent texto="Olá, tudo bem?" />)
    expect(screen.getByText("Olá, tudo bem?")).toBeInTheDocument()
  })

  it("transforma um link em âncora clicável com target=_blank", () => {
    render(<PostContent texto="veja https://exemplo.com/pagina agora" />)
    const link = screen.getByRole("link", { name: "https://exemplo.com/pagina" })
    expect(link).toHaveAttribute("href", "https://exemplo.com/pagina")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("destaca uma @menção sem transformá-la em link", () => {
    render(<PostContent texto="oi @joao_silva, tudo bem?" />)
    const mencao = screen.getByText("@joao_silva")
    expect(mencao.tagName).toBe("SPAN")
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("lida com link e menção juntos no mesmo texto", () => {
    render(<PostContent texto="@maria olha isso: https://banco.com/oferta" />)
    expect(screen.getByText("@maria")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "https://banco.com/oferta" })).toBeInTheDocument()
  })

  it("preserva texto antes, entre e depois de uma menção", () => {
    const { container } = render(<PostContent texto="antes @user depois" />)
    expect(container.textContent).toBe("antes @user depois")
  })
})
