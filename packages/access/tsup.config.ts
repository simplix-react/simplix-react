import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
    external: [/^@casl/, /^@simplix-react/],
  },
  {
    entry: { react: "src/react/index.ts" },
    format: ["esm"],
    dts: true,
    splitting: true,
    treeshake: true,
    external: [/^@casl/, /^react/, /^@simplix-react/],
  },
]);
