import { describe, it, expect } from "vitest";
import { createJwtAdapter } from "../adapters/jwt-adapter.js";

// Helper to create a fake JWT token from a payload object
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = "fake-sig";
  return `${header}.${body}.${signature}`;
}

describe("createJwtAdapter", () => {
  describe("permissionFormat: map", () => {
    it("extracts rules from permission map in JWT claims", async () => {
      const token = fakeJwt({
        sub: "user-1",
        username: "john",
        roles: ["ROLE_ADMIN"],
        permissions: {
          Pet: ["list", "view"],
          Order: ["create"],
        },
      });

      const adapter = createJwtAdapter();
      const result = await adapter.extract(token);

      expect(result.rules).toEqual([
        { action: "list", subject: "Pet" },
        { action: "view", subject: "Pet" },
        { action: "create", subject: "Order" },
      ]);
      expect(result.user?.userId).toBe("user-1");
      expect(result.user?.username).toBe("john");
      expect(result.roles).toEqual(["ROLE_ADMIN"]);
    });
  });

  describe("permissionFormat: flat", () => {
    it("extracts rules from flat permission strings", async () => {
      const token = fakeJwt({
        sub: "user-1",
        username: "john",
        roles: [],
        permissions: ["PET:list", "PET:view"],
      });

      const adapter = createJwtAdapter({ permissionFormat: "flat" });
      const result = await adapter.extract(token);

      expect(result.rules).toEqual([
        { action: "list", subject: "PET" },
        { action: "view", subject: "PET" },
      ]);
    });
  });

  describe("permissionFormat: scopes", () => {
    it("extracts rules from scope string in permissions claim", async () => {
      const token = fakeJwt({
        sub: "user-1",
        username: "john",
        roles: [],
        permissions: "pet:read pet:write",
      });

      const adapter = createJwtAdapter({ permissionFormat: "scopes" });
      const result = await adapter.extract(token);

      expect(result.rules).toEqual([
        { action: "read", subject: "pet" },
        { action: "write", subject: "pet" },
      ]);
    });

    it("falls back to scope claim when permissions is not a string", async () => {
      const token = fakeJwt({
        sub: "user-1",
        username: "john",
        roles: [],
        scope: "pet:read order:write",
      });

      const adapter = createJwtAdapter({ permissionFormat: "scopes" });
      const result = await adapter.extract(token);

      expect(result.rules).toEqual([
        { action: "read", subject: "pet" },
        { action: "write", subject: "order" },
      ]);
    });
  });

  describe("super admin detection", () => {
    it("detects isSuperAdmin boolean flag", async () => {
      const token = fakeJwt({
        sub: "admin-1",
        username: "admin",
        roles: [],
        isSuperAdmin: true,
        permissions: {},
      });

      const adapter = createJwtAdapter();
      const result = await adapter.extract(token);

      expect(result.user?.isSuperAdmin).toBe(true);
    });

    it("detects isSuperAdmin string true", async () => {
      const token = fakeJwt({
        sub: "admin-1",
        username: "admin",
        roles: [],
        isSuperAdmin: "true",
        permissions: {},
      });

      const adapter = createJwtAdapter();
      const result = await adapter.extract(token);

      expect(result.user?.isSuperAdmin).toBe(true);
    });

    it("uses custom superAdminKey", async () => {
      const token = fakeJwt({
        sub: "admin-1",
        username: "admin",
        roles: [],
        is_god: true,
        permissions: {},
      });

      const adapter = createJwtAdapter({ superAdminKey: "is_god" });
      const result = await adapter.extract(token);

      expect(result.user?.isSuperAdmin).toBe(true);
    });
  });

  describe("custom transform", () => {
    it("uses transform function to override extraction", async () => {
      const token = fakeJwt({
        custom_data: { perms: ["view:Pet"] },
      });

      const adapter = createJwtAdapter({
        transform: (claims) => {
          const data = claims.custom_data as { perms: string[] };
          return {
            rules: data.perms.map((p) => {
              const [action, subject] = p.split(":");
              return { action: action!, subject: subject! };
            }),
            roles: ["custom-role"],
          };
        },
      });
      const result = await adapter.extract(token);

      expect(result.rules).toEqual([{ action: "view", subject: "Pet" }]);
      expect(result.roles).toEqual(["custom-role"]);
    });
  });

  describe("error handling", () => {
    it("returns empty result for non-string input", async () => {
      const adapter = createJwtAdapter();
      const result = await adapter.extract(null);

      expect(result.rules).toEqual([]);
      expect(result.roles).toEqual([]);
    });

    it("returns empty result for undefined input", async () => {
      const adapter = createJwtAdapter();
      const result = await adapter.extract(undefined);

      expect(result.rules).toEqual([]);
    });

    it("throws for invalid JWT format", async () => {
      const adapter = createJwtAdapter();

      await expect(adapter.extract("not-a-jwt")).rejects.toThrow(
        "Invalid JWT format",
      );
    });
  });

  describe("custom claim keys", () => {
    it("uses custom keys for roles, userId, username", async () => {
      const token = fakeJwt({
        user_id: "u-42",
        login: "jane",
        authorities: ["ROLE_USER"],
        perms: { Pet: ["view"] },
      });

      const adapter = createJwtAdapter({
        userIdKey: "user_id",
        usernameKey: "login",
        rolesKey: "authorities",
        permissionsKey: "perms",
      });
      const result = await adapter.extract(token);

      expect(result.user?.userId).toBe("u-42");
      expect(result.user?.username).toBe("jane");
      expect(result.roles).toEqual(["ROLE_USER"]);
      expect(result.rules).toEqual([{ action: "view", subject: "Pet" }]);
    });
  });

  describe("custom decode", () => {
    it("uses custom decode function", async () => {
      const adapter = createJwtAdapter({
        decode: () => ({
          sub: "decoded-user",
          username: "decoded",
          roles: [],
          permissions: { Pet: ["view"] },
        }),
      });

      const result = await adapter.extract("any-token-string");

      expect(result.user?.userId).toBe("decoded-user");
      expect(result.rules).toEqual([{ action: "view", subject: "Pet" }]);
    });
  });
});
