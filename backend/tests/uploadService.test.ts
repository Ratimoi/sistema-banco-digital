import { describe, expect, it, vi, beforeEach } from "vitest"

const uploadMock = vi.fn()
const getPublicUrlMock = vi.fn()
const removeMock = vi.fn()
const fromMock = vi.fn(() => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock, remove: removeMock }))
const createClientMock = vi.fn((..._args: unknown[]) => ({ storage: { from: fromMock } }))

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

const mockEnv: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string } = {
  SUPABASE_URL: "https://teste.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "chave-teste",
}
vi.mock("../src/config/env", () => ({ env: mockEnv }))

const { enviarMidia, removerMidia } = await import("../src/services/uploadService")

const arquivo = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    fieldname: "arquivo",
    originalname: "foto.png",
    mimetype: "image/png",
    buffer: Buffer.from("teste"),
    size: 5,
    ...overrides,
  }) as Express.Multer.File

describe("uploadService.enviarMidia", () => {
  beforeEach(() => {
    uploadMock.mockReset()
    getPublicUrlMock.mockReset()
    fromMock.mockClear()
    mockEnv.SUPABASE_URL = "https://teste.supabase.co"
    mockEnv.SUPABASE_SERVICE_ROLE_KEY = "chave-teste"
  })

  it("rejeita tipo de arquivo não suportado", async () => {
    await expect(enviarMidia(arquivo({ mimetype: "application/pdf" }))).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it("lança 503 quando o Supabase não está configurado", async () => {
    mockEnv.SUPABASE_URL = undefined
    await expect(enviarMidia(arquivo())).rejects.toMatchObject({ statusCode: 503 })
  })

  it("envia o arquivo e retorna a url pública com o tipo detectado", async () => {
    uploadMock.mockResolvedValue({ error: null })
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://teste.supabase.co/storage/v1/object/public/comunidade-midia/abc.png" },
    })

    const resultado = await enviarMidia(arquivo())

    expect(resultado.tipo).toBe("imagem")
    expect(resultado.url).toContain("comunidade-midia")
    expect(fromMock).toHaveBeenCalledWith("comunidade-midia")
  })

  it("detecta vídeo pelo mimetype", async () => {
    uploadMock.mockResolvedValue({ error: null })
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: "https://teste.supabase.co/x.mp4" } })

    const resultado = await enviarMidia(arquivo({ originalname: "video.mp4", mimetype: "video/mp4" }))

    expect(resultado.tipo).toBe("video")
  })

  it("lança 502 quando o upload falha", async () => {
    uploadMock.mockResolvedValue({ error: { message: "falhou" } })
    await expect(enviarMidia(arquivo())).rejects.toMatchObject({ statusCode: 502 })
  })
})

describe("uploadService.removerMidia", () => {
  beforeEach(() => {
    removeMock.mockReset()
    fromMock.mockClear()
    mockEnv.SUPABASE_URL = "https://teste.supabase.co"
    mockEnv.SUPABASE_SERVICE_ROLE_KEY = "chave-teste"
  })

  it("não faz nada quando o Supabase não está configurado", async () => {
    mockEnv.SUPABASE_URL = undefined
    await removerMidia("https://teste.supabase.co/storage/v1/object/public/comunidade-midia/abc.png")
    expect(removeMock).not.toHaveBeenCalled()
  })

  it("não faz nada quando a url não bate com o formato esperado do bucket", async () => {
    await removerMidia("https://outro-dominio.com/arquivo.png")
    expect(removeMock).not.toHaveBeenCalled()
  })

  it("remove o arquivo do bucket a partir do caminho extraído da url pública", async () => {
    await removerMidia("https://teste.supabase.co/storage/v1/object/public/comunidade-midia/abc.png")
    expect(fromMock).toHaveBeenCalledWith("comunidade-midia")
    expect(removeMock).toHaveBeenCalledWith(["abc.png"])
  })
})
