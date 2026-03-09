import { defineConfig, type Options } from "tsup";

export default defineConfig((options): Options[] => [
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: !options.watch,
    splitting: true,
    treeshake: true,
    clean: !options.watch,
    external: [/^@/, /^react/, /^zod/],
  },
  {
    entry: { mock: "src/mock/index.ts" },
    format: ["esm"],
    dts: !options.watch,
    external: [/^@/, /^react/, /^zod/, /^msw/],
  },
]);
