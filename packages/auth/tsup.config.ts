import { defineConfig, type Options } from "tsup";

export default defineConfig((options): Options[] => [
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: !options.watch,
    splitting: true,
    treeshake: true,
    clean: !options.watch,
    external: [/^@simplix-react/],
  },
  {
    entry: { react: "src/react/index.ts" },
    format: ["esm"],
    dts: !options.watch,
    splitting: true,
    treeshake: true,
    external: [/^react/, /^@simplix-react/],
  },
]);
