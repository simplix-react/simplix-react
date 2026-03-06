import type { CrudRole } from "@simplix-react/contract";

/**
 * Configuration for controlling how generated hook wrappers unwrap API responses.
 *
 * @remarks
 * Accepts either a preset name string or a fine-grained object configuration:
 * - `"boot"` — unwraps Spring Boot envelope (`data?.body`)
 * - `"raw"` — no unwrapping (default)
 * - Custom string — references a {@link ResponseAdapterPreset} registered via the plugin registry
 * - Object — provides `unwrapExpression` and/or per-role `unwrapByRole` overrides
 *
 * @example
 * ```ts
 * // Use a preset
 * const config: ResponseAdapterConfig = "boot";
 *
 * // Use a custom unwrap expression
 * const config: ResponseAdapterConfig = {
 *   unwrapExpression: "data?.result",
 *   unwrapByRole: { list: "data?.result?.items" },
 * };
 * ```
 */
export type ResponseAdapterConfig =
  | "boot" // Boot envelope: data?.body
  | "raw" // No unwrap (default)
  | string // Custom preset name
  | {
      /** Simple unwrap via expression (variable name: `data`) */
      unwrapExpression?: string;
      /** @deprecated Not supported in code generation — use unwrapExpression instead */
      unwrap?: (data: unknown) => unknown;
      /** Per-role unwrap override (e.g., list vs get need different expressions) */
      unwrapByRole?: Partial<Record<CrudRole, string>>;
    };

/**
 * Reusable preset definition for a response adapter.
 *
 * @remarks
 * Registered via {@link registerResponseAdapterPreset} for reuse across specs.
 * Presets define how responses are unwrapped and how mock responses are wrapped.
 *
 * @example
 * ```ts
 * import { registerResponseAdapterPreset } from "@simplix-react/cli";
 *
 * registerResponseAdapterPreset("my-api", {
 *   unwrapExpression: "data?.payload",
 *   mockResponseWrapper: "wrapMyApiResponse",
 *   mockResponseWrapperImport: 'import { wrapMyApiResponse } from "./helpers"',
 * });
 * ```
 */
export interface ResponseAdapterPreset {
  /** Unwrap expression template (variable name: `data`). Omit when mutator handles unwrap. */
  unwrapExpression?: string;
  /** Import statement for error adapter (used in mutator setup) */
  errorAdapterImport?: string;
  /** Error adapter export name */
  errorAdapterName?: string;
  /** Mock response wrapper function name */
  mockResponseWrapper?: string;
  /** Import statement for mock response wrapper */
  mockResponseWrapperImport?: string;
}
