import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: { index: "src/index.ts", vite: "src/vite-plugin.ts" },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  treeshake: true,
  clean: !options.watch,
  external: [/^zod/, /^msw/, /^@simplix-react/, /^vite$/],
}));
