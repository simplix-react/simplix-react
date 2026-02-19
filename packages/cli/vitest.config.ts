import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "hbs-text",
      transform(_code, id) {
        if (id.endsWith(".hbs")) {
          const content = readFileSync(id, "utf-8");
          return { code: `export default ${JSON.stringify(content)}` };
        }
      },
    },
  ],
  test: {
    include: ["src/__tests__/**/*.test.ts"],
  },
});
