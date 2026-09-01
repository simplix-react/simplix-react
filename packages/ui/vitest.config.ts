import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
    setupFiles: ["src/__tests__/setup.ts"],
    // The field tests render whole option catalogues into jsdom — the timezone combobox
    // alone lays out every IANA zone — and a single synchronous render passes 5s while the
    // rest of the package's 2500 tests run beside it. Vitest's default cut those renders
    // off; they assert what the field shows, never how fast it gets there.
    testTimeout: 30_000,
  },
});
