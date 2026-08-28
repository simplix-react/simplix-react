import type { OpenApiNamingStrategy } from "../naming/naming-strategy.js";
import type { ResponseAdapterConfig } from "../adaptation/response-adapter.js";
import type { DtoMeta } from "../../meta/ir-types.js";

/**
 * What a Java container name from the DTO meta IR becomes on the TypeScript side.
 *
 * @remarks
 * The IR names a container as the backend spells it (`List`, `Map`, `Page`,
 * `SimpliXApiResponse`); which TypeScript type and zod factory it turns into is a decision
 * belonging to the spec profile, not to the IR.
 */
export interface ContainerMapping {
  /** The TypeScript type name, or absent when the container disappears from client types. */
  ts?: string;
  /** The zod factory that wraps the inner schema. */
  zod?: string;
  /** Module the TS type and zod factory are imported from. */
  import?: string;
  /** The mutator strips this container before React Query sees it, so it has no client type. */
  unwrap?: boolean;
  /** For `Map`: the key type, which the IR does not carry. */
  keyType?: string;
}

/**
 * Files a profile contributes from the IR's `extensions` payload.
 */
/** The generic a labeled enum's wire shape is spelled with. */
export interface LabeledEnumMapping {
  /** The type's name. */
  ts: string;
  /** Module it is imported from. */
  import: string;
}

export interface MetaExtensionOutput {
  /** Path relative to `generated-meta/` → file content. */
  files: Record<string, string>;
}

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
  /** Server-relative path of the DTO meta endpoint. */
  metaEndpoint?: string;
  /** Callback for downloading the DTO meta IR from a server. */
  metaDownloader?: (serverOrigin: string) => Promise<DtoMeta | undefined>;
  /** Java container name → the TypeScript type and zod factory it becomes. */
  containerTypes?: Record<string, ContainerMapping>;
  /**
   * The generic that wraps an enum value with its label, which a backend serializing a labeled
   * enum as an object needs. Absent, every enum is its bare value union in both directions — the
   * honest reading for a backend that does not label them.
   */
  labeledEnum?: LabeledEnumMapping;
  /** Turns a contributor's `extensions` payload into generated files. */
  metaExtensions?: (meta: DtoMeta) => MetaExtensionOutput | undefined;
}
