import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuth } from "../create-auth.js";
import { memoryStore } from "../stores/memory-store.js";
import { bearerScheme } from "../schemes/bearer-scheme.js";
import type { AuthScheme, TokenStore } from "../types.js";

function createMockScheme(
  overrides: Partial<AuthScheme> = {},
): AuthScheme {
  return {
    name: "mock",
    getHeaders: vi.fn().mockResolvedValue({}),
    isAuthenticated: vi.fn().mockReturnValue(false),
    clear: vi.fn(),
    ...overrides,
  };
}

describe("createAuth", () => {
  let store: TokenStore;

  beforeEach(() => {
    store = memoryStore();
  });

  describe("isAuthenticated", () => {
    it("returns false when no scheme is authenticated", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      expect(auth.isAuthenticated()).toBe(false);
    });

    it("returns true when at least one scheme is authenticated", () => {
      const auth = createAuth({
        schemes: [
          createMockScheme(),
          createMockScheme({ isAuthenticated: () => true }),
        ],
        store,
      });

      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe("getAccessToken", () => {
    it("returns null when store has no access token", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      expect(auth.getAccessToken()).toBeNull();
    });

    it("returns the access token from the store", () => {
      store.set("access_token", "my-token");

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      expect(auth.getAccessToken()).toBe("my-token");
    });

    it("returns null when no store is provided", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
      });

      expect(auth.getAccessToken()).toBeNull();
    });
  });

  describe("setTokens", () => {
    it("stores access token in the store", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.setTokens({ accessToken: "new-token" });

      expect(store.get("access_token")).toBe("new-token");
    });

    it("stores refresh token in the store", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.setTokens({
        accessToken: "at",
        refreshToken: "rt",
      });

      expect(store.get("access_token")).toBe("at");
      expect(store.get("refresh_token")).toBe("rt");
    });

    it("notifies subscribers after storing tokens", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      auth.setTokens({ accessToken: "token" });

      expect(listener).toHaveBeenCalledOnce();
    });

    it("does not store tokens when no store is provided", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
      });

      // Should not throw
      auth.setTokens({ accessToken: "token" });
    });
  });

  describe("clear", () => {
    it("clears all schemes", () => {
      const scheme1 = createMockScheme();
      const scheme2 = createMockScheme();

      const auth = createAuth({
        schemes: [scheme1, scheme2],
        store,
      });

      auth.clear();

      expect(scheme1.clear).toHaveBeenCalledOnce();
      expect(scheme2.clear).toHaveBeenCalledOnce();
    });

    it("clears the store", () => {
      store.set("access_token", "token");
      store.set("refresh_token", "rt");

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.clear();

      expect(store.get("access_token")).toBeNull();
      expect(store.get("refresh_token")).toBeNull();
    });

    it("resets user to null", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.setUser({ id: 1, name: "Alice" });
      expect(auth.getUser()).toEqual({ id: 1, name: "Alice" });

      auth.clear();

      expect(auth.getUser()).toBeNull();
    });

    it("notifies subscribers", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      auth.clear();

      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe("subscribe", () => {
    it("returns an unsubscribe function", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      const unsub = auth.subscribe(listener);

      auth.setTokens({ accessToken: "token" });
      expect(listener).toHaveBeenCalledOnce();

      unsub();

      auth.setTokens({ accessToken: "token2" });
      expect(listener).toHaveBeenCalledOnce();
    });

    it("supports multiple subscribers", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      auth.subscribe(listener1);
      auth.subscribe(listener2);

      auth.setTokens({ accessToken: "token" });

      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
    });
  });

  describe("rehydrate", () => {
    it("notifies subscribers when no access token exists", async () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      await auth.rehydrate();

      expect(listener).toHaveBeenCalledOnce();
    });

    it("calls onRehydrate when access token exists", async () => {
      store.set("access_token", "stored-token");
      const onRehydrate = vi.fn().mockResolvedValue(true);

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
        onRehydrate,
      });

      await auth.rehydrate();

      expect(onRehydrate).toHaveBeenCalledWith("stored-token");
    });

    it("clears state when onRehydrate returns false", async () => {
      store.set("access_token", "expired-token");
      const scheme = createMockScheme();
      const onRehydrate = vi.fn().mockResolvedValue(false);

      const auth = createAuth({
        schemes: [scheme],
        store,
        onRehydrate,
      });

      auth.setUser({ id: 1 });
      await auth.rehydrate();

      expect(scheme.clear).toHaveBeenCalledOnce();
      expect(store.get("access_token")).toBeNull();
      expect(auth.getUser()).toBeNull();
    });

    it("preserves state when onRehydrate returns true", async () => {
      store.set("access_token", "valid-token");
      const scheme = createMockScheme();
      const onRehydrate = vi.fn().mockResolvedValue(true);

      const auth = createAuth({
        schemes: [scheme],
        store,
        onRehydrate,
      });

      await auth.rehydrate();

      expect(scheme.clear).not.toHaveBeenCalled();
      expect(store.get("access_token")).toBe("valid-token");
    });

    it("notifies subscribers after rehydration", async () => {
      store.set("access_token", "token");
      const onRehydrate = vi.fn().mockResolvedValue(true);

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
        onRehydrate,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      await auth.rehydrate();

      expect(listener).toHaveBeenCalledOnce();
    });

    it("skips onRehydrate when no callback is provided", async () => {
      store.set("access_token", "token");

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      await auth.rehydrate();

      expect(listener).toHaveBeenCalledOnce();
      expect(store.get("access_token")).toBe("token");
    });
  });

  describe("getUser / setUser", () => {
    it("returns null by default", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      expect(auth.getUser()).toBeNull();
    });

    it("stores and retrieves a user object", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const user = { id: 1, name: "Alice" };
      auth.setUser(user);

      expect(auth.getUser()).toEqual(user);
    });

    it("supports typed user retrieval", () => {
      interface User {
        id: number;
        name: string;
      }

      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.setUser<User>({ id: 42, name: "Bob" });

      const user = auth.getUser<User>();
      expect(user?.id).toBe(42);
      expect(user?.name).toBe("Bob");
    });

    it("notifies subscribers when user is set", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      const listener = vi.fn();
      auth.subscribe(listener);

      auth.setUser({ id: 1 });

      expect(listener).toHaveBeenCalledOnce();
    });

    it("sets user to null", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      auth.setUser({ id: 1 });
      auth.setUser(null);

      expect(auth.getUser()).toBeNull();
    });
  });

  describe("fetchFn", () => {
    it("returns a fetch function", () => {
      const auth = createAuth({
        schemes: [createMockScheme()],
        store,
      });

      expect(typeof auth.fetchFn).toBe("function");
    });
  });

  describe("integration with bearerScheme", () => {
    it("full login/logout flow", () => {
      const auth = createAuth({
        schemes: [
          bearerScheme({ store, token: () => store.get("access_token") }),
        ],
        store,
      });

      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getAccessToken()).toBeNull();

      auth.setTokens({ accessToken: "my-token" });

      expect(auth.isAuthenticated()).toBe(true);
      expect(auth.getAccessToken()).toBe("my-token");

      auth.clear();

      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getAccessToken()).toBeNull();
    });
  });
});
