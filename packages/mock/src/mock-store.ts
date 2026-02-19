/**
 * In-memory entity store backed by `Map` instances.
 *
 * Each entity gets its own `Map<string | number, Record<string, unknown>>`,
 * keyed by a caller-provided store name (e.g. `"project_tasks"`).
 */

const stores = new Map<string, Map<string | number, Record<string, unknown>>>();
const counters = new Map<string, number>();

/**
 * Returns the `Map` for the given store name, creating it lazily if needed.
 *
 * @param storeName - Unique identifier for the entity store.
 * @returns The entity map keyed by record id.
 */
export function getEntityStore(
  storeName: string,
): Map<string | number, Record<string, unknown>> {
  let store = stores.get(storeName);
  if (!store) {
    store = new Map();
    stores.set(storeName, store);
  }
  return store;
}

/**
 * Returns the next auto-increment id for the given store and advances the counter.
 *
 * @param storeName - Unique identifier for the entity store.
 * @returns The next numeric id.
 */
export function getNextId(storeName: string): number {
  const current = counters.get(storeName) ?? 0;
  const next = current + 1;
  counters.set(storeName, next);
  return next;
}

/**
 * Loads an array of records into the store and sets the auto-increment counter
 * to one past the maximum numeric id found.
 *
 * @param storeName - Unique identifier for the entity store.
 * @param records - The records to seed. Each must have an `id` field.
 */
export function seedEntityStore(
  storeName: string,
  records: Record<string, unknown>[],
): void {
  const store = getEntityStore(storeName);
  let maxId = counters.get(storeName) ?? 0;

  for (const record of records) {
    const id = record.id as string | number;
    store.set(id, { ...record });
    if (typeof id === "number" && id > maxId) {
      maxId = id;
    }
  }

  counters.set(storeName, maxId);
}

/**
 * Clears all entity stores and resets all auto-increment counters.
 */
export function resetStore(): void {
  stores.clear();
  counters.clear();
}
