import type { PGlite } from "@electric-sql/pglite";
import { initPGlite } from "./pglite.js";

type RequestHandler = unknown;

/**
 * Describes the configuration required by {@link setupMockWorker}.
 *
 * Combines PGlite database setup (migrations and seed data) with MSW request
 * handlers into a single bootstrap configuration.
 *
 * @example
 * ```ts
 * import type { MockServerConfig } from "@simplix-react/mock";
 * import { deriveMockHandlers } from "@simplix-react/mock";
 * import { projectContract } from "./contract";
 * import { runMigrations } from "./migrations";
 * import { seedData } from "./seed";
 *
 * const config: MockServerConfig = {
 *   dataDir: "idb://project-mock",
 *   migrations: [runMigrations],
 *   seed: [seedData],
 *   handlers: deriveMockHandlers(projectContract.config),
 * };
 * ```
 *
 * @see {@link setupMockWorker} - Consumes this config to bootstrap the mock environment.
 */
export interface MockServerConfig {
  /**
   * IndexedDB data directory for PGlite persistence.
   *
   * @defaultValue `"idb://simplix-mock"`
   */
  dataDir?: string;

  /**
   * Migration functions to run in order.
   *
   * Each function receives the PGlite instance and should create or alter tables.
   */
  migrations: Array<(db: PGlite) => Promise<void>>;

  /**
   * Seed functions to run in order (after migrations).
   *
   * Each function receives the PGlite instance and should insert initial data.
   */
  seed: Array<(db: PGlite) => Promise<void>>;

  /**
   * MSW request handlers to register with the service worker.
   *
   * Typically produced by {@link deriveMockHandlers}.
   */
  handlers: RequestHandler[];
}

/**
 * Bootstraps a complete mock environment with PGlite and MSW.
 *
 * Performs the following steps in order:
 * 1. Initializes a PGlite instance at the configured `dataDir`
 * 2. Runs all migration functions sequentially
 * 3. Runs all seed functions sequentially
 * 4. Starts the MSW service worker with the provided handlers
 *
 * @param config - The {@link MockServerConfig} describing database setup and handlers.
 *
 * @example
 * ```ts
 * import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
 * import { projectContract } from "./contract";
 * import { runMigrations } from "./migrations";
 * import { seedData } from "./seed";
 *
 * await setupMockWorker({
 *   dataDir: "idb://project-mock",
 *   migrations: [runMigrations],
 *   seed: [seedData],
 *   handlers: deriveMockHandlers(projectContract.config),
 * });
 * ```
 *
 * @see {@link MockServerConfig} - Configuration shape.
 * @see {@link deriveMockHandlers} - Generates MSW handlers from a contract.
 * @see {@link initPGlite} - Underlying PGlite initialization.
 */
export async function setupMockWorker(config: MockServerConfig): Promise<void> {
  const {
    dataDir = "idb://simplix-mock",
    migrations,
    seed,
    handlers,
  } = config;

  // Initialize PGlite
  const db = await initPGlite(dataDir);

  // Run migrations
  for (const migration of migrations) {
    await migration(db);
  }

  // Run seed
  for (const seedFn of seed) {
    await seedFn(db);
  }

  // Start MSW worker (dynamic import to avoid bundling msw in non-mock builds)
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker(...(handlers as Parameters<typeof setupWorker>));

  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}
