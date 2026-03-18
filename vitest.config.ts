import { readFileSync, mkdirSync } from "node:fs";
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
          root: "./packages/cli",
          include: ["src/__tests__/**/*.test.ts"],
        },
      },
      "extensions/simplix-boot/packages/*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      reportsDirectory: "./coverage",
      include: [
        "packages/*/src/**/*.{ts,tsx}",
        "extensions/simplix-boot/packages/*/src/**/*.{ts,tsx}",
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
