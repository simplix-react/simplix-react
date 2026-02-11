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

  /** Mock layer defaults */
  mock?: {
    defaultLimit?: number;
    maxLimit?: number;
    /** PGlite IndexedDB storage path (default: "idb://simplix-mock") */
    dataDir?: string;
  };

  /** Code generation options */
  codegen?: {
    /** Prepend auto-generated header comment to generated files (default: true) */
    header?: boolean;
  };

  /** OpenAPI code generation options */
  openapi?: {
    /** Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/) */
    domains?: Record<string, string[]>;
  };
}
