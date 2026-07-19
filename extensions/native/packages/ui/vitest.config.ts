import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Only platform-neutral modules are unit-tested here; component files
    // import react-native and are validated by typecheck + the consuming app.
    include: ["src/__tests__/**/*.test.ts"],
  },
});
