import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Ensure coverage temp directory exists (workaround for vitest v8 race condition)
try { mkdirSync("./coverage/.tmp", { recursive: true }); } catch {}

export default defineConfig({
  plugins: [
    {
      name: "hbs-text",
      enforce: "pre" as const,
      load(id) {
        if (id.endsWith(".hbs")) {
          const content = readFileSync(id, "utf-8");
          return `export default ${JSON.stringify(content)}`;
        }
      },
    },
  ],
  test: {
    projects: [
      "packages/!(cli)",
      {
        extends: true,
        test: {
          name: "cli",
          // Absolute, resolved from this file. A relative root is resolved against the invocation
          // cwd, so `pnpm --filter @simplix-react/cli test` — which runs with cwd already inside
          // the package — looked for `packages/cli/packages/cli`, matched nothing, and reported
          // "No test files found" while exiting 0. Every other project is a glob and carries no
          // root, which is why only this one was affected.
          root: fileURLToPath(new URL("./packages/cli", import.meta.url)),
          include: ["src/__tests__/**/*.test.ts"],
        },
      },
      "extensions/simplix-boot/packages/*",
      "extensions/native/packages/*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      reportsDirectory: "./coverage",
      include: [
        "packages/*/src/**/*.{ts,tsx}",
        "extensions/simplix-boot/packages/*/src/**/*.{ts,tsx}",
        "extensions/native/packages/*/src/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/__tests__/**",
        "**/index.ts",
        "**/*.d.ts",
        "**/types.ts",
      ],
    },
  },
});
