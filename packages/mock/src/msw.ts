import { resetStore, seedEntityStore } from "./mock-store.js";

type RequestHandler = unknown;

/**
 * Describes a single domain's mock configuration.
 *
 * Each domain groups its own handlers and seed data together,
 * enabling selective activation via the {@link enabled} flag.
 *
 * @example
 * ```ts
 * import type { MockDomainConfig } from "@simplix-react/mock";
 * import { deriveMockHandlers } from "@simplix-react/mock";
 * import { projectContract } from "./contract";
 *
 * const projectDomain: MockDomainConfig = {
 *   name: "project",
 *   handlers: deriveMockHandlers(projectContract.config),
 *   seed: {
 *     project_tasks: [
 *       { id: 1, title: "Task 1", createdAt: "2025-01-01" },
 *     ],
 *   },
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
   * Seed data keyed by entity store name.
   *
   * Each key corresponds to a store name (e.g. `"project_tasks"`)
   * and the value is an array of records to pre-populate.
   */
  seed?: Record<string, Record<string, unknown>[]>;
}

/**
 * Describes the configuration required by {@link setupMockWorker}.
 *
 * Combines multiple {@link MockDomainConfig} entries into a single bootstrap
 * configuration.
 *
 * @example
 * ```ts
 * import type { MockServerConfig } from "@simplix-react/mock";
 *
 * const config: MockServerConfig = {
 *   domains: [projectDomain, userDomain],
 * };
 * ```
 *
 * @see {@link setupMockWorker} - Consumes this config to bootstrap the mock environment.
 * @see {@link MockDomainConfig} - Individual domain configuration.
 */
export interface MockServerConfig {
  /** Domain configurations to activate. */
  domains: MockDomainConfig[];
}

/**
 * Bootstraps a complete mock environment with MSW and in-memory stores.
 *
 * Performs the following steps in order:
 * 1. Filters domains to only those with `enabled !== false`
 * 2. Resets the in-memory store
 * 3. Seeds each entity store from domain seed data
 * 4. Starts the MSW service worker with the combined handlers
 *
 * @param config - The {@link MockServerConfig} describing domains and their setup.
 *
 * @example
 * ```ts
 * import { setupMockWorker } from "@simplix-react/mock";
 *
 * await setupMockWorker({
 *   domains: [projectDomain, userDomain],
 * });
 * ```
 *
 * @see {@link MockServerConfig} - Configuration shape.
 * @see {@link MockDomainConfig} - Individual domain configuration.
 * @see {@link deriveMockHandlers} - Generates MSW handlers from a contract.
 */
export async function setupMockWorker(config: MockServerConfig): Promise<void> {
  const { domains } = config;

  const enabledDomains = domains.filter((d) => d.enabled !== false);

  // Skip setup entirely when no domains are configured
  if (enabledDomains.length === 0) return;

  // Reset in-memory stores
  resetStore();

  // Seed entity stores from each domain
  for (const domain of enabledDomains) {
    if (domain.seed) {
      for (const [storeName, records] of Object.entries(domain.seed)) {
        seedEntityStore(storeName, records);
      }
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
