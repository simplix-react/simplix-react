import type { PGlite } from "@electric-sql/pglite";

let instance: PGlite | null = null;

/**
 * Initializes a singleton PGlite instance with the given data directory.
 *
 * Uses a dynamic import so that `@electric-sql/pglite` remains an optional peer
 * dependency. Subsequent calls return the already-initialized instance.
 *
 * @param dataDir - The IndexedDB data directory for persistence (e.g. `"idb://simplix-mock"`).
 * @returns The initialized PGlite instance.
 *
 * @example
 * ```ts
 * import { initPGlite } from "@simplix-react/mock";
 *
 * const db = await initPGlite("idb://project-mock");
 * await db.query("SELECT 1");
 * ```
 *
 * @see {@link getPGliteInstance} - Retrieves the current instance without re-initializing.
 * @see {@link resetPGliteInstance} - Clears the singleton for testing.
 */
export async function initPGlite(dataDir: string): Promise<PGlite> {
  if (instance) return instance;

  // Dynamic import to keep PGlite as optional peer dependency
  const { PGlite: PGliteClass } = await import("@electric-sql/pglite");
  instance = new PGliteClass(dataDir);
  return instance;
}

/**
 * Returns the current PGlite singleton instance.
 *
 * Throws an error if {@link initPGlite} has not been called yet.
 *
 * @returns The active PGlite instance.
 * @throws Error if PGlite has not been initialized.
 *
 * @example
 * ```ts
 * import { getPGliteInstance } from "@simplix-react/mock";
 *
 * const db = getPGliteInstance();
 * const result = await db.query("SELECT * FROM tasks");
 * ```
 */
export function getPGliteInstance(): PGlite {
  if (!instance) {
    throw new Error(
      "PGlite not initialized. Call initPGlite() first.",
    );
  }
  return instance;
}

/**
 * Resets the PGlite singleton instance to `null`.
 *
 * Intended for use in test teardown to ensure a clean state between test runs.
 *
 * @example
 * ```ts
 * import { resetPGliteInstance } from "@simplix-react/mock";
 *
 * afterEach(() => {
 *   resetPGliteInstance();
 * });
 * ```
 */
export function resetPGliteInstance(): void {
  instance = null;
}
