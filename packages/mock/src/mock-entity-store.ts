/**
 * Typed in-memory entity store for Orval-based mock handlers.
 *
 * Unlike `mock-store.ts` (Map-based, untyped, contract-system specific),
 * this store works directly with Orval model types (Pet, Order, User, etc.)
 * and provides a simple CRUD API backed by an array.
 */

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MockEntityStore<T> {
  /** All records */
  list(): T[];
  /** Paginated list (0-based page index). Sort format: `"field.direction"` (e.g. `"createdAt.desc"`). */
  listPaged(page: number, size: number, sort?: string): PagedResult<T>;
  /** Filter records by predicate */
  filter(predicate: (item: T) => boolean): T[];
  /** Find by primary key */
  getById(id: string | number): T | undefined;
  /** Create a new record (auto-assigns ID if missing) */
  create(data: Partial<T>): T;
  /** Update an existing record by PK */
  update(id: string | number, data: Partial<T>): T | undefined;
  /** Update if exists, create if not */
  upsert(data: T): T;
  /** Delete by PK */
  remove(id: string | number): boolean;
  /** Reset to initial seed data */
  reset(): void;
}

/**
 * Create a typed in-memory CRUD store for mock handlers.
 *
 * Uses `object` constraint (not `Record<string, unknown>`) to support
 * Orval-generated interfaces which lack index signatures.
 */
export function createMockEntityStore<T extends object>(
  seeds: T[],
  idField: string = "id",
): MockEntityStore<T> {
  let items: T[] = [];
  let nextId = 0;

  const field = (record: T): unknown => (record as Record<string, unknown>)[idField];
  const matchId = (item: T, id: string | number): boolean => {
    const val = field(item);
    // Support both string and numeric lookups (route params are strings, seeds use numbers)
    return val === id || (typeof id === "string" && val === Number(id)) || (typeof id === "number" && val === String(id));
  };
  const setField = (record: T, value: unknown): void => {
    (record as Record<string, unknown>)[idField] = value;
  };

  function computeNextId(records: T[]): number {
    let max = 0;
    for (const record of records) {
      const val = field(record);
      if (typeof val === "number" && val > max) {
        max = val;
      }
    }
    return max + 1;
  }

  function init(): void {
    items = seeds.map((s) => ({ ...s }));
    nextId = computeNextId(items);
  }

  // Initialize on creation
  init();

  return {
    list() {
      return items;
    },

    listPaged(page, size, sort?) {
      let sorted = items;
      if (sort) {
        const sepIdx = sort.lastIndexOf(".");
        const sortField = sepIdx !== -1 ? sort.slice(0, sepIdx) : sort;
        const desc = sepIdx !== -1 ? sort.slice(sepIdx + 1) === "desc" : false;
        sorted = [...items].sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[sortField];
          const bVal = (b as Record<string, unknown>)[sortField];
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;
          const cmp = typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal));
          return desc ? -cmp : cmp;
        });
      }
      const totalElements = sorted.length;
      const totalPages = size > 0 ? Math.ceil(totalElements / size) : 1;
      const start = page * size;
      const content = sorted.slice(start, start + size);
      return {
        content,
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
        empty: content.length === 0,
      };
    },

    filter(predicate) {
      return items.filter(predicate);
    },

    getById(id) {
      return items.find((item) => matchId(item, id));
    },

    create(data) {
      const record = { ...data } as T;
      if (field(record) == null) {
        setField(record, nextId++);
      } else {
        const val = field(record);
        if (typeof val === "number" && val >= nextId) {
          nextId = val + 1;
        }
      }
      items.push(record);
      return record;
    },

    update(id, data) {
      const idx = items.findIndex((item) => matchId(item, id));
      if (idx === -1) return undefined;
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    },

    upsert(data) {
      const id = field(data) as string | number;
      const existing = this.update(id, data);
      if (existing) return existing;
      return this.create(data);
    },

    remove(id) {
      const len = items.length;
      items = items.filter((item) => !matchId(item, id));
      return items.length < len;
    },

    reset() {
      init();
    },
  };
}
