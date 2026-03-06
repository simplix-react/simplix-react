import { resolve } from "node:path";
import type { HttpMethod, CrudRole } from "@simplix-react/contract";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ResponseAdapterConfig } from "../openapi/adaptation/response-adapter.js";

/**
 * Defines how a CRUD role maps to HTTP method(s) and path pattern(s).
 *
 * Path patterns use basePath-relative segments:
 * - `/` — basePath itself (collection)
 * - `/:id` — basePath + any path param
 * - `/*` — basePath + any single segment
 * - `/literal` — basePath + exact literal segment
 */
export interface CrudEndpointPattern {
  /** HTTP method(s). Array for multiple methods (e.g., `["PUT", "PATCH"]`). */
  method: HttpMethod | HttpMethod[];
  /** BasePath-relative path pattern(s). Array for multiple patterns. */
  path: string | string[];
}

/**
 * Environment entry for `.http` file generation.
 *
 * @see {@link SimplixConfig.http} for environment configuration
 */
export interface SimplixHttpEnvironment {
  /** Absolute base URL for HTTP requests in this environment. */
  baseUrl: string;
}

/**
 * Project-level configuration loaded from `simplix.config.ts` at the project root.
 *
 * @remarks
 * Controls code generation behavior, mock layer defaults, package naming,
 * and OpenAPI domain splitting. All fields are optional — sensible defaults
 * are applied when omitted.
 *
 * @example
 * ```ts
 * import { defineConfig } from "@simplix-react/cli";
 *
 * export default defineConfig({
 *   api: { baseUrl: "/api/v1" },
 *   packages: { prefix: "acme" },
 *   codegen: { header: true },
 *   openapi: {
 *     domains: {
 *       project: ["Projects", "Tasks"],
 *       auth: ["Auth", "Users"],
 *     },
 *   },
 * });
 * ```
 *
 * @see {@link defineConfig} — identity wrapper for type-safe autocompletion
 */
export interface SimplixConfig {
  /** API settings — used for basePath in code generation */
  api?: {
    /** API base path (default: "/api") */
    baseUrl?: string;
  };

  /** Global QueryBuilder — applied to all domains */
  queryBuilder?: unknown;

  /** Package naming options */
  packages?: {
    /** Short prefix for generated package names (default: derived from root package.json name) */
    prefix?: string;
  };

  /** .http file environment settings */
  http?: {
    environments?: Record<string, SimplixHttpEnvironment>;
  };

  /** Code generation options */
  codegen?: {
    /** Prepend auto-generated header comment to generated files (default: true) */
    header?: boolean;
  };

  /** Internationalization settings */
  i18n?: {
    /** Supported locale codes (default: ["en", "ko", "ja"]) */
    locales?: string[];
    /** Default locale code (default: "en") */
    defaultLocale?: string;
  };

  /** OpenAPI code generation — array of per-spec configurations */
  openapi?: OpenAPISpecConfig[];
}

/** Per-spec OpenAPI configuration */
export interface OpenAPISpecConfig {
  /** OpenAPI spec file path (relative to project root) or URL */
  spec: string;
  /** Spec Profile preset name (bundles naming + responseAdapter) */
  profile?: string;
  /** NamingStrategy — overrides profile's naming if both are set */
  naming?: OpenApiNamingStrategy;
  /** ResponseAdapter — overrides profile's responseAdapter if both are set */
  responseAdapter?: ResponseAdapterConfig;
  /** Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/) */
  domains: Record<string, string[]>;
  /** CRUD role detection patterns. When omitted, no CRUD roles are assigned. */
  crud?: Partial<Record<CrudRole, CrudEndpointPattern>>;
}

/** Find the spec config that contains the given domain name */
export function findSpecForDomain(
  specs: OpenAPISpecConfig[] | undefined,
  domainName: string,
): OpenAPISpecConfig | undefined {
  return specs?.find((s) => domainName in s.domains);
}

/** Find the spec config matching a given source path/URL */
export function findSpecBySource(
  specs: OpenAPISpecConfig[] | undefined,
  source: string,
  rootDir: string,
): OpenAPISpecConfig | undefined {
  return specs?.find((s) => {
    if (isUrlSpec(s.spec) || isUrlSpec(source)) {
      return s.spec === source;
    }
    return resolve(rootDir, s.spec) === resolve(rootDir, source);
  });
}

function isUrlSpec(source: string): boolean {
  return source.startsWith("http://") || source.startsWith("https://");
}

/** Per-entity CRUD role → operationId mapping */
export interface CrudEntityConfig {
  list?: string;
  get?: string;
  getForEdit?: string;
  create?: string;
  update?: string;
  delete?: string;
  multiUpdate?: string;
  batchUpdate?: string;
  batchDelete?: string;
  search?: string;
  tree?: string;
  subtree?: string;
  /** Extended roles (e.g. order, activate, archive) */
  [role: string]: string | undefined;
}

/** Entity name → CRUD config mapping for a domain package */
export type CrudMap = Record<string, CrudEntityConfig>;
