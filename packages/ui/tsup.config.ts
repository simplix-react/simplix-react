import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  treeshake: true,
  clean: !options.watch,
  external: [/^react/, /^@simplix-react/, /^@tanstack/, /^@dnd-kit/, /^maplibre/, /^pmtiles/, /^protomaps/, /^apexcharts/],
  onSuccess: "cp src/styles.css dist/styles.css",
}));
