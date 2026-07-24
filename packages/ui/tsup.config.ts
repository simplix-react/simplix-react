import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: {
    index: "src/index.ts",
    "plate-editor": "src/fields/plate-editor/index.ts",
    // Viewer-only entry: read-only consumers import this instead of the full
    // plate-editor barrel, whose plugin re-exports carry the heavy runtime.
    "plate-viewer": "src/fields/plate-editor/plate-viewer.tsx",
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
  // Ship the raw CSS layer verbatim: the flat entries plus the whole theme/
  // subtree (base + presets) the aggregator @imports. rm -rf guards stale
  // presets across --watch rebuilds (clean is off in watch mode).
  onSuccess:
    "cp src/styles.css dist/styles.css && cp src/theme.css dist/theme.css && rm -rf dist/theme && cp -R src/theme dist/theme && rm -f dist/theme/manifest.ts",
}));
