import { describe, it, expect } from "vitest";
import { createLocalQueryStore } from "../local-query.js";

// Derive the exact parameter type the store's dehydrate predicate expects, so
// the fake stays in sync without importing a (dual-versioned) Query type.
type Store = ReturnType<typeof createLocalQueryStore>;
type ShouldDehydrate = NonNullable<
  NonNullable<Store["persistOptions"]["dehydrateOptions"]>["shouldDehydrateQuery"]
>;
type QueryArg = Parameters<ShouldDehydrate>[0];

// In-memory Storage stub — the test runs in node (no jsdom), so `window`
// is absent; inject storage explicitly.
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
}

// Minimal Query stand-in for the dehydrate predicate (it only reads queryKey + state.status).
function fakeQuery(queryKey: readonly unknown[], status: "success" | "pending" | "error"): QueryArg {
  return { queryKey, state: { status } } as unknown as QueryArg;
}

function makeStore() {
  return createLocalQueryStore({
    version: "1",
    storageKey: "test:cache",
    storage: memoryStorage(),
  });
}

describe("createLocalQueryStore", () => {
  describe("localQuery", () => {
    it("registers the key and defaults staleTime to Infinity and gcTime to maxAge", () => {
      const store = createLocalQueryStore({
        version: "1",
        storageKey: "test:cache",
        maxAge: 5000,
        storage: memoryStorage(),
      });
      const options = store.localQuery({
        key: ["policy"],
        queryFn: async () => "value",
      });

      expect(options.queryKey).toEqual(["policy"]);
      expect(options.staleTime).toBe(Infinity);
      expect(options.gcTime).toBe(5000);
      expect(store.persistOptions.dehydrateOptions?.shouldDehydrateQuery?.(fakeQuery(["policy"], "success"))).toBe(true);
    });

    it("respects explicit staleTime and gcTime overrides", () => {
      const store = makeStore();
      const options = store.localQuery({
        key: ["policy"],
        queryFn: async () => "value",
        staleTime: 1000,
        gcTime: 2000,
      });
      expect(options.staleTime).toBe(1000);
      expect(options.gcTime).toBe(2000);
    });
  });

  describe("localQueryKey", () => {
    it("does not register the same key twice", () => {
      const store = makeStore();
      store.localQueryKey(["menu", "tree"]);
      store.localQueryKey(["menu", "tree"]);
      const filter = store.persistOptions.dehydrateOptions?.shouldDehydrateQuery;
      // A registered prefix matches its longer query keys.
      expect(filter?.(fakeQuery(["menu", "tree", "ADMIN"], "success"))).toBe(true);
    });
  });

  describe("persistOptions.shouldDehydrateQuery", () => {
    it("dehydrates registered successful queries (prefix match)", () => {
      const store = makeStore();
      store.localQueryKey(["menu", "tree"]);
      const filter = store.persistOptions.dehydrateOptions?.shouldDehydrateQuery;
      expect(filter?.(fakeQuery(["menu", "tree", "FRONT"], "success"))).toBe(true);
    });

    it("excludes unregistered queries even when successful", () => {
      const store = makeStore();
      store.localQueryKey(["menu", "tree"]);
      const filter = store.persistOptions.dehydrateOptions?.shouldDehydrateQuery;
      expect(filter?.(fakeQuery(["user", "list"], "success"))).toBe(false);
    });

    it("excludes registered queries that are not successful", () => {
      const store = makeStore();
      store.localQueryKey(["menu", "tree"]);
      const filter = store.persistOptions.dehydrateOptions?.shouldDehydrateQuery;
      expect(filter?.(fakeQuery(["menu", "tree", "FRONT"], "pending"))).toBe(false);
    });
  });

  describe("persistOptions", () => {
    it("uses version as buster and applies maxAge", () => {
      const store = createLocalQueryStore({
        version: "v9",
        storageKey: "test:cache",
        maxAge: 1234,
        storage: memoryStorage(),
      });
      expect(store.persistOptions.buster).toBe("v9");
      expect(store.persistOptions.maxAge).toBe(1234);
    });
  });
});
