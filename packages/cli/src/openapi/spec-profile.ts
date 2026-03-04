import type { OpenApiNamingStrategy } from "./naming-strategy.js";
import type { ResponseAdapterConfig } from "./response-adapter.js";

/**
 * Spec Profile bundles naming strategy + response adapter as a reusable preset.
 *
 * Usage in simplix.config.ts:
 * ```ts
 * { spec: "openapi/boot.json", profile: "simplix-boot", domains: { ... } }
 * ```
 */
export interface SpecProfile {
  naming: OpenApiNamingStrategy;
  responseAdapter: ResponseAdapterConfig;
  /** Hint for app-providers.tsx mutator setup (used by scaffold) */
  mutatorHint?: {
    errorAdapterImport: string;
    errorAdapterExpression: string;
  };
  /** Mutator strategy name for configureMutator/getMutator registry */
  mutatorStrategy?: string;
  /** Extra dependencies to inject into the domain package.json */
  dependencies?: Record<string, string>;
  /** Server-relative i18n endpoint path for downloading translations at codegen time */
  i18nEndpoint?: string;
}
