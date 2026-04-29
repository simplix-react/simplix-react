import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: {
    index: "src/index.ts",
    "plate-editor": "src/fields/plate-editor/index.ts",
  },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  treeshake: true,
  clean: !options.watch,
  external: [
    /^react/, /^@simplix-react/, /^@tanstack/, /^@dnd-kit/,
    /^maplibre/, /^pmtiles/, /^protomaps/, /^apexcharts/,
    /^@?platejs/, /^lowlight/, /^lucide-react/,
  ],
  onSuccess: "cp src/styles.css dist/styles.css",
}));
