import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Platform-neutral modules only; native-module adapters are validated by
    // typecheck + the consuming app.
    include: ["src/__tests__/**/*.test.ts"],
  },
});
