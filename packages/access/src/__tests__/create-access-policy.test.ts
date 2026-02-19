import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAccessPolicy } from "../create-access-policy.js";
import { createStaticAdapter } from "../adapters/static-adapter.js";
import type { AccessAdapter, AccessUser } from "../types.js";

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (_index: number) => null,
  } as Storage;
}

const testUser: AccessUser = {
  userId: "user-1",
  username: "john",
  roles: ["ROLE_ADMIN"],
};

describe("createAccessPolicy", () => {
  describe("initial state", () => {
    it("denies all actions when created empty", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });

      expect(policy.can("view", "Pet")).toBe(false);
      expect(policy.cannot("view", "Pet")).toBe(true);
      expect(policy.user).toBeNull();
      expect(policy.roles).toEqual([]);
    });
  });

  describe("update", () => {
    it("applies rules from adapter after update", async () => {
      const adapter = createStaticAdapter(
        [{ action: "view", subject: "Pet" }],
        testUser,
      );
      const policy = createAccessPolicy({ adapter });

      await policy.update(null);

      expect(policy.can("view", "Pet")).toBe(true);
      expect(policy.cannot("delete", "Pet")).toBe(true);
      expect(policy.user).toEqual(testUser);
    });

    it("preserves existing user when adapter returns no user", async () => {
      const adapter: AccessAdapter = {
        async extract() {
          return { rules: [{ action: "view", subject: "Pet" }] };
        },
      };
      const policy = createAccessPolicy({ adapter });
      policy.setRules([], testUser);

      await policy.update(null);

      expect(policy.user).toEqual(testUser);
    });
  });

  describe("setRules", () => {
    it("directly sets rules and user", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });

      policy.setRules(
        [{ action: "create", subject: "Pet" }],
        testUser,
        ["ROLE_ADMIN"],
      );

      expect(policy.can("create", "Pet")).toBe(true);
      expect(policy.user).toEqual(testUser);
      expect(policy.roles).toEqual(["ROLE_ADMIN"]);
    });

    it("keeps existing user/roles when not provided", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });
      policy.setRules([], testUser, ["ROLE_ADMIN"]);

      policy.setRules([{ action: "view", subject: "Pet" }]);

      expect(policy.user).toEqual(testUser);
      expect(policy.roles).toEqual(["ROLE_ADMIN"]);
    });
  });

  describe("clear", () => {
    it("resets all state", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
      });
      await policy.update(null);
      expect(policy.can("view", "Pet")).toBe(true);

      policy.clear();

      expect(policy.can("view", "Pet")).toBe(false);
      expect(policy.user).toBeNull();
      expect(policy.roles).toEqual([]);
    });
  });

  describe("subscribe", () => {
    it("notifies listeners on update", async () => {
      const listener = vi.fn();
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([{ action: "view", subject: "Pet" }]),
      });
      policy.subscribe(listener);

      await policy.update(null);

      expect(listener).toHaveBeenCalledOnce();
    });

    it("notifies listeners on setRules", () => {
      const listener = vi.fn();
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });
      policy.subscribe(listener);

      policy.setRules([{ action: "view", subject: "Pet" }]);

      expect(listener).toHaveBeenCalledOnce();
    });

    it("notifies listeners on clear", () => {
      const listener = vi.fn();
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });
      policy.subscribe(listener);

      policy.clear();

      expect(listener).toHaveBeenCalledOnce();
    });

    it("unsubscribes correctly", async () => {
      const listener = vi.fn();
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([{ action: "view", subject: "Pet" }]),
      });
      const unsubscribe = policy.subscribe(listener);

      unsubscribe();
      await policy.update(null);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("isSuperAdmin", () => {
    it("grants manage:all when user is super admin via flag", async () => {
      const superUser: AccessUser = {
        ...testUser,
        isSuperAdmin: true,
      };
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          superUser,
        ),
      });

      await policy.update(null);

      expect(policy.can("manage", "all")).toBe(true);
      expect(policy.can("delete", "Pet")).toBe(true);
      expect(policy.can("anything", "anywhere")).toBe(true);
    });

    it("grants manage:all via custom isSuperAdmin checker", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
        isSuperAdmin: (user) => user.roles.includes("ROLE_ADMIN"),
      });

      await policy.update(null);

      expect(policy.can("manage", "all")).toBe(true);
    });

    it("does not grant super admin when checker returns false", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
        isSuperAdmin: () => false,
      });

      await policy.update(null);

      expect(policy.can("view", "Pet")).toBe(true);
      expect(policy.can("delete", "Pet")).toBe(false);
    });
  });

  describe("hasRole / hasAnyRole", () => {
    it("checks role with ROLE_ prefix normalization", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });
      policy.setRules([], testUser, ["ROLE_ADMIN", "ROLE_USER"]);

      expect(policy.hasRole("ADMIN")).toBe(true);
      expect(policy.hasRole("ROLE_ADMIN")).toBe(true);
      expect(policy.hasRole("MANAGER")).toBe(false);
    });

    it("checks if user has any of the given roles", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });
      policy.setRules([], testUser, ["ROLE_USER"]);

      expect(policy.hasAnyRole(["ADMIN", "USER"])).toBe(true);
      expect(policy.hasAnyRole(["ADMIN", "MANAGER"])).toBe(false);
    });
  });

  describe("persist", () => {
    let storage: Storage;

    beforeEach(() => {
      storage = createMockStorage();
    });

    it("persists state to storage on update", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
        persist: { storage },
      });

      await policy.update(null);

      const stored = JSON.parse(storage.getItem("simplix-access")!);
      expect(stored.rules).toHaveLength(1);
      expect(stored.user.userId).toBe("user-1");
    });

    it("uses custom storage key", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([{ action: "view", subject: "Pet" }]),
        persist: { storage, key: "custom-key" },
      });

      await policy.update(null);

      expect(storage.getItem("custom-key")).not.toBeNull();
      expect(storage.getItem("simplix-access")).toBeNull();
    });

    it("clears persisted state on clear()", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([{ action: "view", subject: "Pet" }]),
        persist: { storage },
      });
      await policy.update(null);
      expect(storage.getItem("simplix-access")).not.toBeNull();

      policy.clear();

      expect(storage.getItem("simplix-access")).toBeNull();
    });

    it("rehydrates state from storage", async () => {
      // First: populate storage
      const policy1 = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
        persist: { storage },
      });
      await policy1.update(null);

      // Second: rehydrate from storage
      const policy2 = createAccessPolicy({
        adapter: createStaticAdapter([]),
        persist: { storage },
      });
      const rehydrated = policy2.rehydrate();

      expect(rehydrated).toBe(true);
      expect(policy2.can("view", "Pet")).toBe(true);
      expect(policy2.user?.userId).toBe("user-1");
    });

    it("returns false when no persisted state exists", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
        persist: { storage },
      });

      expect(policy.rehydrate()).toBe(false);
    });

    it("returns false when persist is not configured", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });

      expect(policy.rehydrate()).toBe(false);
    });
  });

  describe("loadPublicAccess", () => {
    it("loads public rules from array", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
        publicAccess: [{ action: "view", subject: "Pet" }],
      });

      await policy.loadPublicAccess();

      expect(policy.can("view", "Pet")).toBe(true);
      expect(policy.user).toBeNull();
    });

    it("loads public rules from adapter", async () => {
      const publicAdapter = createStaticAdapter([
        { action: "list", subject: "Pet" },
      ]);
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
        publicAccess: publicAdapter,
      });

      await policy.loadPublicAccess();

      expect(policy.can("list", "Pet")).toBe(true);
    });

    it("does nothing when publicAccess is not configured", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });

      await policy.loadPublicAccess();

      expect(policy.can("view", "Pet")).toBe(false);
    });
  });

  describe("getSnapshot", () => {
    it("returns current state as a snapshot", async () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter(
          [{ action: "view", subject: "Pet" }],
          testUser,
        ),
      });
      await policy.update(null);

      const snapshot = policy.getSnapshot();

      expect(snapshot.user).toEqual(testUser);
      expect(snapshot.roles).toEqual(["ROLE_ADMIN"]);
      expect(snapshot.rules).toHaveLength(1);
      expect(snapshot.rules[0]).toEqual({
        action: "view",
        subject: "Pet",
      });
    });

    it("returns empty snapshot for fresh policy", () => {
      const policy = createAccessPolicy({
        adapter: createStaticAdapter([]),
      });

      const snapshot = policy.getSnapshot();

      expect(snapshot.user).toBeNull();
      expect(snapshot.roles).toEqual([]);
      expect(snapshot.rules).toEqual([]);
    });
  });
});
