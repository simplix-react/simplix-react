import type { OpenApiNamingStrategy } from "../naming/naming-strategy.js";
import type { ResponseAdapterConfig } from "../adaptation/response-adapter.js";

/**
 * Entity info for i18n key mapping.
 */
export interface I18nEntityInfo {
  pascalName: string;
  name: string;
}

/**
 * Callback that downloads and transforms i18n data from a server.
 * Returns a Map of locale → domain-scoped JSON data to overlay.
 */
export type I18nDownloader = (
  serverOrigin: string,
  entities: I18nEntityInfo[],
  locales: string[],
) => Promise<Map<string, Record<string, unknown>> | undefined>;

/**
 * Bundles a naming strategy and response adapter as a reusable preset for a backend convention.
 *
 * @remarks
 * Registered via {@link registerSpecProfile} or as part of a {@link CliPlugin}.
 * Referenced by name in `simplix.config.ts` via the `profile` field.
 *
 * @example
 * ```ts
 * // simplix.config.ts
 * export default {
 *   specs: [
 *     { spec: "openapi/boot.json", profile: "simplix-boot", domains: { ... } },
 *   ],
 * };
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
  /** Callback for downloading and transforming i18n data from a server */
  i18nDownloader?: I18nDownloader;
}
