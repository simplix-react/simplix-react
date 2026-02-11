import { describe, it, expect } from "vitest";
import { memoryStore } from "../stores/memory-store.js";

describe("memoryStore", () => {
  it("returns null for missing keys", () => {
    const store = memoryStore();
    expect(store.get("nonexistent")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    const store = memoryStore();
    store.set("token", "abc123");
    expect(store.get("token")).toBe("abc123");
  });

  it("overwrites existing values", () => {
    const store = memoryStore();
    store.set("token", "old");
    store.set("token", "new");
    expect(store.get("token")).toBe("new");
  });

  it("removes a specific key", () => {
    const store = memoryStore();
    store.set("a", "1");
    store.set("b", "2");
    store.remove("a");
    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBe("2");
  });

  it("clears all keys", () => {
    const store = memoryStore();
    store.set("a", "1");
    store.set("b", "2");
    store.clear();
    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBeNull();
  });

  it("handles remove on nonexistent key without error", () => {
    const store = memoryStore();
    expect(() => store.remove("missing")).not.toThrow();
  });

  it("creates independent instances", () => {
    const store1 = memoryStore();
    const store2 = memoryStore();
    store1.set("key", "value1");
    store2.set("key", "value2");
    expect(store1.get("key")).toBe("value1");
    expect(store2.get("key")).toBe("value2");
  });
});
