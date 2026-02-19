import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/*/vitest.config.ts",
  "extensions/simplix-boot/packages/*/vitest.config.ts",
]);
