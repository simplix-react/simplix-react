import { describe, it, expect, beforeEach } from "vitest";
import { createMockEntityStore } from "../mock-entity-store.js";

interface Pet {
  id: number;
  name: string;
  status: string;
}

const seeds: Pet[] = [
  { id: 1, name: "Buddy", status: "available" },
  { id: 2, name: "Max", status: "pending" },
  { id: 3, name: "Luna", status: "available" },
];

describe("createMockEntityStore", () => {
  let store: ReturnType<typeof createMockEntityStore<Pet>>;

  beforeEach(() => {
    store = createMockEntityStore<Pet>([...seeds.map((s) => ({ ...s }))]);
  });

  // ── list ──

  describe("list", () => {
    it("returns all seeded items", () => {
      expect(store.list()).toHaveLength(3);
      expect(store.list()[0].name).toBe("Buddy");
    });

    it("returns empty array when no seeds", () => {
      const empty = createMockEntityStore<Pet>([]);
      expect(empty.list()).toHaveLength(0);
    });
  });

  // ── listPaged ──

  describe("listPaged", () => {
    it("returns first page with correct metadata", () => {
      const result = store.listPaged(0, 2);

      expect(result.content).toHaveLength(2);
      expect(result.totalElements).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.number).toBe(0);
      expect(result.size).toBe(2);
      expect(result.first).toBe(true);
      expect(result.last).toBe(false);
      expect(result.empty).toBe(false);
    });

    it("returns last page correctly", () => {
      const result = store.listPaged(1, 2);

      expect(result.content).toHaveLength(1);
      expect(result.first).toBe(false);
      expect(result.last).toBe(true);
    });

    it("returns empty page beyond range", () => {
      const result = store.listPaged(5, 2);

      expect(result.content).toHaveLength(0);
      expect(result.empty).toBe(true);
    });

    it("sorts ascending by field", () => {
      const result = store.listPaged(0, 10, "name.asc");

      expect(result.content[0].name).toBe("Buddy");
      expect(result.content[1].name).toBe("Luna");
      expect(result.content[2].name).toBe("Max");
    });

    it("sorts descending by field", () => {
      const result = store.listPaged(0, 10, "name.desc");

      expect(result.content[0].name).toBe("Max");
      expect(result.content[1].name).toBe("Luna");
      expect(result.content[2].name).toBe("Buddy");
    });

    it("sorts by numeric field", () => {
      const result = store.listPaged(0, 10, "id.desc");

      expect(result.content[0].id).toBe(3);
      expect(result.content[1].id).toBe(2);
      expect(result.content[2].id).toBe(1);
    });

    it("defaults to ascending when no direction suffix", () => {
      const result = store.listPaged(0, 10, "name");

      expect(result.content[0].name).toBe("Buddy");
      expect(result.content[2].name).toBe("Max");
    });
  });

  // ── filter ──

  describe("filter", () => {
    it("returns matching items", () => {
      const available = store.filter((p) => p.status === "available");

      expect(available).toHaveLength(2);
      expect(available[0].name).toBe("Buddy");
      expect(available[1].name).toBe("Luna");
    });

    it("returns empty array when no match", () => {
      const sold = store.filter((p) => p.status === "sold");
      expect(sold).toHaveLength(0);
    });
  });

  // ── getById ──

  describe("getById", () => {
    it("returns item by numeric id", () => {
      const pet = store.getById(1);
      expect(pet).toBeDefined();
      expect(pet!.name).toBe("Buddy");
    });

    it("returns item by string id (coerced)", () => {
      const pet = store.getById("2");
      expect(pet).toBeDefined();
      expect(pet!.name).toBe("Max");
    });

    it("returns undefined for non-existent id", () => {
      expect(store.getById(999)).toBeUndefined();
    });
  });

  // ── create ──

  describe("create", () => {
    it("adds a record and auto-assigns id when missing", () => {
      const created = store.create({ name: "Rex", status: "available" });

      expect(created.id).toBe(4);
      expect(created.name).toBe("Rex");
      expect(store.list()).toHaveLength(4);
    });

    it("preserves provided id", () => {
      const created = store.create({ id: 10, name: "Spot", status: "pending" });

      expect(created.id).toBe(10);
      expect(store.getById(10)).toBeDefined();
    });

    it("updates nextId counter when creating with high id", () => {
      store.create({ id: 100, name: "High", status: "available" });
      const next = store.create({ name: "Auto", status: "available" });

      expect(next.id).toBe(101);
    });
  });

  // ── update ──

  describe("update", () => {
    it("updates existing record by numeric id", () => {
      const updated = store.update(1, { status: "sold" });

      expect(updated).toBeDefined();
      expect(updated!.status).toBe("sold");
      expect(updated!.name).toBe("Buddy");
    });

    it("updates existing record by string id", () => {
      const updated = store.update("2", { name: "Maximus" });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe("Maximus");
    });

    it("returns undefined for non-existent id", () => {
      expect(store.update(999, { name: "Ghost" })).toBeUndefined();
    });
  });

  // ── upsert ──

  describe("upsert", () => {
    it("updates existing record", () => {
      const result = store.upsert({ id: 1, name: "UpdatedBuddy", status: "sold" });

      expect(result.name).toBe("UpdatedBuddy");
      expect(store.list()).toHaveLength(3);
    });

    it("creates new record when id does not exist", () => {
      const result = store.upsert({ id: 50, name: "New", status: "available" });

      expect(result.id).toBe(50);
      expect(store.list()).toHaveLength(4);
    });
  });

  // ── remove ──

  describe("remove", () => {
    it("removes existing record and returns true", () => {
      expect(store.remove(1)).toBe(true);
      expect(store.list()).toHaveLength(2);
      expect(store.getById(1)).toBeUndefined();
    });

    it("removes by string id", () => {
      expect(store.remove("2")).toBe(true);
      expect(store.list()).toHaveLength(2);
    });

    it("returns false for non-existent id", () => {
      expect(store.remove(999)).toBe(false);
      expect(store.list()).toHaveLength(3);
    });
  });

  // ── reset ──

  describe("reset", () => {
    it("restores seed data after mutations", () => {
      store.create({ name: "Extra", status: "available" });
      store.remove(1);
      expect(store.list()).toHaveLength(3);

      store.reset();

      expect(store.list()).toHaveLength(3);
      expect(store.getById(1)).toBeDefined();
      expect(store.getById(1)!.name).toBe("Buddy");
    });

    it("resets id counter", () => {
      store.create({ name: "A", status: "a" });
      store.create({ name: "B", status: "b" });

      store.reset();

      const created = store.create({ name: "After", status: "available" });
      expect(created.id).toBe(4);
    });
  });

  // ── Custom id field ──

  describe("custom idField", () => {
    interface Item {
      code: string;
      label: string;
    }

    it("uses custom id field for lookups", () => {
      const itemStore = createMockEntityStore<Item>(
        [{ code: "abc", label: "Alpha" }],
        "code",
      );

      expect(itemStore.getById("abc")).toBeDefined();
      expect(itemStore.getById("abc")!.label).toBe("Alpha");
    });
  });
});
