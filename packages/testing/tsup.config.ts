import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  treeshake: true,
  clean: !options.watch,
  external: [/^react/, /^@tanstack/, /^@simplix-react/],
}));
