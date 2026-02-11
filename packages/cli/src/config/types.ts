// SimplixConfig — loaded from simplix.config.ts at project root

export interface SimplixHttpEnvironment {
  baseUrl: string;
}

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
