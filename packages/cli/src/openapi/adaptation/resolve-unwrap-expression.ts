import type { CrudRole } from "@simplix-react/contract";
import type { ResponseAdapterConfig } from "./response-adapter.js";
import { getResponseAdapterPreset } from "../plugin-registry.js";

/**
 * Resolves the unwrap expression for a hook wrapper based on the responseAdapter config.
 *
 * @param adapter - ResponseAdapter configuration (preset string or object)
 * @param role - CRUD role for per-role unwrap override
 * @returns Expression string to use in generated hook wrapper (uses `query.data` as variable)
 */
export function resolveUnwrapExpression(
  adapter: ResponseAdapterConfig | undefined,
  role?: CrudRole,
): string {
  if (!adapter || adapter === "raw") return "query.data";

  // Preset (string)
  if (typeof adapter === "string") {
    const preset = getResponseAdapterPreset(adapter);
    return preset?.unwrapExpression
      ? preset.unwrapExpression.replace(/\bdata\b/g, "query.data")
      : "query.data";
  }

  // Object: per-role override → unwrapExpression → unwrap function → fallback
  if (typeof adapter === "object") {
    if (role && adapter.unwrapByRole?.[role]) {
      return adapter.unwrapByRole[role]!.replace(/\bdata\b/g, "query.data");
    }
    if (adapter.unwrapExpression) {
      return adapter.unwrapExpression.replace(/\bdata\b/g, "query.data");
    }
    if (adapter.unwrap) {
      throw new Error(
        "ResponseAdapterConfig.unwrap function is not supported in code generation. " +
        "Use unwrapExpression (string template) instead.",
      );
    }
  }

  return "query.data";
}
