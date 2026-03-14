import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

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
  },
});
