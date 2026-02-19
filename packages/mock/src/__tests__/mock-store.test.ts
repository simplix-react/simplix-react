import { describe, it, expect, beforeEach } from "vitest";
import {
  getEntityStore,
  getNextId,
  seedEntityStore,
  resetStore,
} from "../mock-store.js";

beforeEach(() => {
  resetStore();
});

describe("getEntityStore", () => {
  it("returns a Map", () => {
    const store = getEntityStore("test_items");
    expect(store).toBeInstanceOf(Map);
  });

  it("returns the same Map for the same store name", () => {
    const a = getEntityStore("test_items");
    const b = getEntityStore("test_items");
    expect(a).toBe(b);
  });

  it("returns different Maps for different store names", () => {
    const a = getEntityStore("store_a");
    const b = getEntityStore("store_b");
    expect(a).not.toBe(b);
  });
});

describe("getNextId", () => {
  it("starts at 1", () => {
    expect(getNextId("test_items")).toBe(1);
  });

  it("auto-increments on subsequent calls", () => {
    expect(getNextId("test_items")).toBe(1);
    expect(getNextId("test_items")).toBe(2);
    expect(getNextId("test_items")).toBe(3);
  });

  it("tracks counters independently per store", () => {
    expect(getNextId("store_a")).toBe(1);
    expect(getNextId("store_a")).toBe(2);
    expect(getNextId("store_b")).toBe(1);
  });
});

describe("seedEntityStore", () => {
  it("loads records into the store", () => {
    seedEntityStore("test_items", [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);

    const store = getEntityStore("test_items");
    expect(store.size).toBe(2);
    expect(store.get(1)).toEqual({ id: 1, name: "A" });
    expect(store.get(2)).toEqual({ id: 2, name: "B" });
  });

  it("sets counter to max(existing numeric ids)", () => {
    seedEntityStore("test_items", [
      { id: 5, name: "A" },
      { id: 3, name: "B" },
    ]);

    // Next id should be max(5) + 1 = 6
    expect(getNextId("test_items")).toBe(6);
  });

  it("handles string ids without affecting counter", () => {
    seedEntityStore("test_items", [
      { id: "abc", name: "A" },
      { id: "def", name: "B" },
    ]);

    const store = getEntityStore("test_items");
    expect(store.size).toBe(2);
    // Counter stays at 0, so next id is 1
    expect(getNextId("test_items")).toBe(1);
  });
});

describe("resetStore", () => {
  it("clears all stores and counters", () => {
    seedEntityStore("test_items", [{ id: 1, name: "A" }]);
    getNextId("test_items"); // advance counter

    resetStore();

    const store = getEntityStore("test_items");
    expect(store.size).toBe(0);
    expect(getNextId("test_items")).toBe(1);
  });
});
