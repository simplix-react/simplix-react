import type { SimplixConfig } from "./types.js";

/**
 * Identity function that provides type-safe autocompletion for `simplix.config.ts`.
 *
 * @remarks
 * Place a `simplix.config.ts` file at the project root and export the result
 * of `defineConfig()` as the default export. The CLI reads this file to
 * configure code generation, mock defaults, and package naming.
 *
 * @param config - Project-level Simplix configuration object
 * @returns The same config object, unchanged
 *
 * @example
 * ```ts
 * // simplix.config.ts
 * import { defineConfig } from "@simplix-react/cli";
 *
 * export default defineConfig({
 *   api: { baseUrl: "/api/v1" },
 *   packages: { prefix: "my-app" },
 *   mock: { defaultLimit: 20 },
 * });
 * ```
 *
 * @see {@link SimplixConfig} for all available configuration options
 */
export function defineConfig(config: SimplixConfig): SimplixConfig {
  return config;
}
