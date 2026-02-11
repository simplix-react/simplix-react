import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: [/^zod/, /^react/, /^@tanstack/, /^@simplix-react/],
});
