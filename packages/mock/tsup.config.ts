import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", vite: "src/vite-plugin.ts" },
  format: ["esm"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: [/^zod/, /^msw/, /^@simplix-react/, /^vite$/],
});
