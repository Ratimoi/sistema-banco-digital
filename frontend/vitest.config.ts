import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // @testing-library/react só desmonta automaticamente entre os testes (evitando um teste
    // "vazar" DOM pro próximo) quando detecta `afterEach` global — sem isso, cada teste teria que
    // chamar cleanup() manualmente.
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
