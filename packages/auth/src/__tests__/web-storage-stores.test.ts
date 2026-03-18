// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { createWebStorageStore } from "../stores/create-web-storage-store.js";
import { localStorageStore } from "../stores/local-storage-store.js";
import { sessionStorageStore } from "../stores/session-storage-store.js";

describe("createWebStorageStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null for missing keys", () => {
    const store = createWebStorageStore(localStorage, "test:");
    expect(store.get("nonexistent")).toBeNull();
  });

  it("stores and retrieves a value with prefix", () => {
    const store = createWebStorageStore(localStorage, "test:");
    store.set("token", "abc123");
    expect(store.get("token")).toBe("abc123");
    expect(localStorage.getItem("test:token")).toBe("abc123");
  });

  it("overwrites existing values", () => {
    const store = createWebStorageStore(localStorage, "test:");
    store.set("token", "old");
    store.set("token", "new");
    expect(store.get("token")).toBe("new");
  });

  it("removes a specific key", () => {
    const store = createWebStorageStore(localStorage, "test:");
    store.set("a", "1");
    store.set("b", "2");
    store.remove("a");
    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBe("2");
  });

  it("clears only prefixed keys", () => {
    const store = createWebStorageStore(localStorage, "test:");
    store.set("a", "1");
    store.set("b", "2");
    localStorage.setItem("other:key", "untouched");

    store.clear();

    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBeNull();
    expect(localStorage.getItem("other:key")).toBe("untouched");
  });

  it("uses default prefix when none provided", () => {
    const store = createWebStorageStore(localStorage);
    store.set("token", "val");
    expect(localStorage.getItem("auth:token")).toBe("val");
  });
});

describe("localStorageStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves values with default prefix", () => {
    const store = localStorageStore();
    store.set("access_token", "my-token");
    expect(store.get("access_token")).toBe("my-token");
    expect(localStorage.getItem("auth:access_token")).toBe("my-token");
  });

  it("uses custom prefix", () => {
    const store = localStorageStore("myapp:");
    store.set("access_token", "custom");
    expect(localStorage.getItem("myapp:access_token")).toBe("custom");
  });

  it("removes a key", () => {
    const store = localStorageStore("app:");
    store.set("token", "val");
    store.remove("token");
    expect(store.get("token")).toBeNull();
  });

  it("clears only prefixed keys", () => {
    const store = localStorageStore("app:");
    store.set("a", "1");
    store.set("b", "2");
    localStorage.setItem("other:c", "3");

    store.clear();

    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBeNull();
    expect(localStorage.getItem("other:c")).toBe("3");
  });
});

describe("sessionStorageStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and retrieves values with default prefix", () => {
    const store = sessionStorageStore();
    store.set("access_token", "session-token");
    expect(store.get("access_token")).toBe("session-token");
    expect(sessionStorage.getItem("auth:access_token")).toBe("session-token");
  });

  it("uses custom prefix", () => {
    const store = sessionStorageStore("sess:");
    store.set("access_token", "val");
    expect(sessionStorage.getItem("sess:access_token")).toBe("val");
  });

  it("returns null for missing keys", () => {
    const store = sessionStorageStore();
    expect(store.get("nonexistent")).toBeNull();
  });

  it("removes a specific key", () => {
    const store = sessionStorageStore();
    store.set("a", "1");
    store.set("b", "2");
    store.remove("a");
    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBe("2");
  });

  it("clears only prefixed keys", () => {
    const store = sessionStorageStore("sess:");
    store.set("a", "1");
    store.set("b", "2");
    sessionStorage.setItem("other:c", "3");

    store.clear();

    expect(store.get("a")).toBeNull();
    expect(store.get("b")).toBeNull();
    expect(sessionStorage.getItem("other:c")).toBe("3");
  });

  it("handles clear with no matching keys", () => {
    sessionStorage.setItem("unrelated", "value");
    const store = sessionStorageStore("empty:");
    store.clear();
    expect(sessionStorage.getItem("unrelated")).toBe("value");
  });
});
