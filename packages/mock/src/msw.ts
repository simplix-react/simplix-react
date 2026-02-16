import type { PGlite } from "@electric-sql/pglite";
import { initPGlite } from "./pglite.js";

type RequestHandler = unknown;

/**
 * Describes a single domain's mock configuration.
 *
 * Each domain groups its own handlers, migrations, and seed data together,
 * enabling selective activation via the {@link enabled} flag.
 *
 * @example
 * ```ts
 * import type { MockDomainConfig } from "@simplix-react/mock";
 * import { deriveMockHandlers } from "@simplix-react/mock";
 * import { projectContract } from "./contract";
 * import { runMigrations } from "./migrations";
 * import { seedData } from "./seed";
 *
 * const projectDomain: MockDomainConfig = {
 *   name: "project",
 *   handlers: deriveMockHandlers(projectContract.config),
 *   migrations: [runMigrations],
 *   seed: [seedData],
 * };
 * ```
 *
 * @see {@link MockServerConfig} - Aggregates multiple domains.
 * @see {@link setupMockWorker} - Consumes domains to bootstrap the mock environment.
 */
export interface MockDomainConfig {
  /** Unique name identifying this domain (used for logging/debugging). */
  name: string;

  /**
   * Whether this domain is active.
   *
   * @defaultValue `true`
   */
  enabled?: boolean;

  /**
   * MSW request handlers for this domain.
   *
   * Typically produced by {@link deriveMockHandlers}.
   */
  handlers: RequestHandler[];

  /**
   * Migration functions to run in order.
   *
   * Each function receives the PGlite instance and should create or alter tables.
   */
  migrations: Array<(db: PGlite) => Promise<void>>;

  /**
   * Seed functions to run in order (after all migrations across all domains complete).
   *
   * Each function receives the PGlite instance and should insert initial data.
   */
  seed?: Array<(db: PGlite) => Promise<void>>;
}

/**
 * Describes the configuration required by {@link setupMockWorker}.
 *
 * Combines multiple {@link MockDomainConfig} entries into a single bootstrap
 * configuration with an optional shared data directory.
 *
 * @example
 * ```ts
 * import type { MockServerConfig } from "@simplix-react/mock";
 *
 * const config: MockServerConfig = {
 *   dataDir: "idb://my-app-mock",
 *   domains: [projectDomain, userDomain],
 * };
 * ```
 *
 * @see {@link setupMockWorker} - Consumes this config to bootstrap the mock environment.
 * @see {@link MockDomainConfig} - Individual domain configuration.
 */
export interface MockServerConfig {
  /**
   * IndexedDB data directory for PGlite persistence.
   *
   * @defaultValue `"idb://simplix-mock"`
   */
  dataDir?: string;

  /** Domain configurations to activate. */
  domains: MockDomainConfig[];
}

/**
 * Bootstraps a complete mock environment with PGlite and MSW.
 *
 * Performs the following steps in order:
 * 1. Filters domains to only those with `enabled !== false`
 * 2. Initializes a PGlite instance at the configured `dataDir`
 * 3. Runs all migration functions across enabled domains sequentially
 * 4. Runs all seed functions across enabled domains sequentially
 * 5. Starts the MSW service worker with the combined handlers
 *
 * @param config - The {@link MockServerConfig} describing domains and their setup.
 *
 * @example
 * ```ts
 * import { setupMockWorker } from "@simplix-react/mock";
 *
 * await setupMockWorker({
 *   dataDir: "idb://my-app-mock",
 *   domains: [projectDomain, userDomain],
 * });
 * ```
 *
 * @see {@link MockServerConfig} - Configuration shape.
 * @see {@link MockDomainConfig} - Individual domain configuration.
 * @see {@link deriveMockHandlers} - Generates MSW handlers from a contract.
 * @see {@link initPGlite} - Underlying PGlite initialization.
 */
export async function setupMockWorker(config: MockServerConfig): Promise<void> {
  const { dataDir = "idb://simplix-mock", domains } = config;

  const enabledDomains = domains.filter((d) => d.enabled !== false);

  // Initialize PGlite
  const db = await initPGlite(dataDir);

  // Run all migrations across enabled domains
  for (const domain of enabledDomains) {
    for (const migration of domain.migrations) {
      await migration(db);
    }
  }

  // Run all seeds across enabled domains
  for (const domain of enabledDomains) {
    for (const seedFn of domain.seed ?? []) {
      await seedFn(db);
    }
  }

  // Combine handlers from all enabled domains
  const handlers = enabledDomains.flatMap((d) => d.handlers);

  // Start MSW worker (dynamic import to avoid bundling msw in non-mock builds)
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker(...(handlers as Parameters<typeof setupWorker>));

  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}
