import { describe, expect, it, vi, afterEach } from "vitest"
import { logger } from "../src/utils/logger"

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("info grava uma linha JSON em console.log com timestamp e nível", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.info("evento de teste", { extra: 1 })

    expect(spy).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(spy.mock.calls[0][0] as string)
    expect(linha.level).toBe("info")
    expect(linha.mensagem).toBe("evento de teste")
    expect(linha.extra).toBe(1)
    expect(linha.timestamp).toEqual(expect.any(String))
  })

  it("error grava em console.error, não em console.log", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    logger.error("falha de teste")

    expect(logSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const linha = JSON.parse(errorSpy.mock.calls[0][0] as string)
    expect(linha.level).toBe("error")
  })

  it("warn grava em console.log com level warn", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.warn("aviso de teste")
    const linha = JSON.parse(spy.mock.calls[0][0] as string)
    expect(linha.level).toBe("warn")
  })
})
