import type { CrudRole } from "@simplix-react/contract";

/**
 * Response adapter configuration for controlling how hook wrappers
 * unwrap API responses at the hooks layer.
 *
 * - String presets: `"boot"`, `"raw"`, or custom preset name
 * - Object: fine-grained control with expression/function/per-role unwrap
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
 * Preset definition for a response adapter.
 * Registered in RESPONSE_ADAPTER_PRESETS for reuse across specs.
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
