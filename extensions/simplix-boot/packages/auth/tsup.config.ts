import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
    external: [/^@/, /^react/, /^zod/],
  },
  {
    entry: { mock: "src/mock/index.ts" },
    format: ["esm"],
    dts: true,
    external: [/^@/, /^react/, /^zod/, /^msw/],
  },
]);
