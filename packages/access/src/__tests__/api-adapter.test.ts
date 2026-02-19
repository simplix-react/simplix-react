import { describe, it, expect, vi } from "vitest";
import { createApiAdapter } from "../adapters/api-adapter.js";

describe("createApiAdapter", () => {
  describe("default behavior", () => {
    it("fetches from default endpoint and parses permissions", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        permissions: { Pet: ["list", "view"] },
        roles: ["ROLE_USER"],
      });

      const adapter = createApiAdapter({ fetchFn });
      const result = await adapter.extract(null);

      expect(fetchFn).toHaveBeenCalledWith("/api/me/permissions");
      expect(result.rules).toEqual([
        { action: "list", subject: "Pet" },
        { action: "view", subject: "Pet" },
      ]);
      expect(result.roles).toEqual(["ROLE_USER"]);
    });

    it("uses custom endpoint", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        permissions: {},
        roles: [],
      });

      const adapter = createApiAdapter({
        endpoint: "/api/v2/perms",
        fetchFn,
      });
      await adapter.extract(null);

      expect(fetchFn).toHaveBeenCalledWith("/api/v2/perms");
    });

    it("handles nested body.permissions structure", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        body: {
          permissions: { Order: ["create", "view"] },
        },
      });

      const adapter = createApiAdapter({ fetchFn });
      const result = await adapter.extract(null);

      expect(result.rules).toEqual([
        { action: "create", subject: "Order" },
        { action: "view", subject: "Order" },
      ]);
    });

    it("returns empty rules when response has no permissions", async () => {
      const fetchFn = vi.fn().mockResolvedValue({});

      const adapter = createApiAdapter({ fetchFn });
      const result = await adapter.extract(null);

      expect(result.rules).toEqual([]);
      expect(result.roles).toEqual([]);
    });
  });

  describe("transformResponse", () => {
    it("uses custom transform to extract permissions", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        data: {
          perms: { Pet: ["delete"] },
          userRoles: ["ADMIN"],
        },
      });

      const adapter = createApiAdapter({
        fetchFn,
        transformResponse: (response) => {
          const data = (response as Record<string, unknown>)
            .data as Record<string, unknown>;
          return {
            permissions: data.perms as Record<string, string[]>,
            roles: data.userRoles as string[],
          };
        },
      });
      const result = await adapter.extract(null);

      expect(result.rules).toEqual([{ action: "delete", subject: "Pet" }]);
      expect(result.roles).toEqual(["ADMIN"]);
    });

    it("extracts user info via transformResponse", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        permissions: { Pet: ["view"] },
        user: { userId: "u-1", username: "jane" },
      });

      const adapter = createApiAdapter({
        fetchFn,
        transformResponse: (response) => {
          const data = response as Record<string, unknown>;
          return {
            permissions: data.permissions as Record<string, string[]>,
            user: data.user as { userId: string; username: string },
          };
        },
      });
      const result = await adapter.extract(null);

      expect(result.user?.userId).toBe("u-1");
      expect(result.user?.username).toBe("jane");
    });
  });

  describe("fetchFn injection", () => {
    it("propagates errors from fetchFn", async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error("Network error"));

      const adapter = createApiAdapter({ fetchFn });

      await expect(adapter.extract(null)).rejects.toThrow("Network error");
    });
  });
});
