import type { FetchFn } from "@simplix-react/contract";
import { describe, expect, it, vi } from "vitest";

import { createSpringAccessAdapter } from "../spring-access-adapter.js";

function createMockFetch(response: unknown): FetchFn {
  return vi.fn().mockResolvedValue(response) as FetchFn;
}

describe("createSpringAccessAdapter", () => {
  it("fetches from authenticated endpoint by default", async () => {
    const mockFetch = createMockFetch({
      permissions: { Pet: ["list", "view"] },
      roles: ["ROLE_USER"],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    const result = await adapter.extract("some-token");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/user/me/permissions",
    );
    expect(result.rules).toEqual([
      { action: "list", subject: "Pet" },
      { action: "view", subject: "Pet" },
    ]);
    expect(result.roles).toEqual(["ROLE_USER"]);
  });

  it("fetches from public endpoint when authData is null", async () => {
    const mockFetch = createMockFetch({
      permissions: { Public: ["list"] },
      roles: [],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    await adapter.extract(null);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/public/user/permissions",
    );
  });

  it("fetches from public endpoint when authData is undefined", async () => {
    const mockFetch = createMockFetch({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    await adapter.extract(undefined);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/public/user/permissions",
    );
  });

  it("uses custom endpoints", async () => {
    const mockFetch = createMockFetch({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({
      permissionsEndpoint: "/custom/perms",
      publicPermissionsEndpoint: "/custom/public/perms",
      fetchFn: mockFetch,
    });

    await adapter.extract("token");
    expect(mockFetch).toHaveBeenCalledWith("/custom/perms");

    await adapter.extract(null);
    expect(mockFetch).toHaveBeenCalledWith("/custom/public/perms");
  });

  it("sets isSuperAdmin true when response says so", async () => {
    const mockFetch = createMockFetch({
      permissions: { Pet: ["list"] },
      roles: ["ROLE_USER"],
      isSuperAdmin: true,
    });

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    const result = await adapter.extract("token");

    expect(result.user?.isSuperAdmin).toBe(true);
    expect(result.rules[0]).toEqual({ action: "manage", subject: "all" });
  });

  it("detects super admin from systemAdminRole", async () => {
    const mockFetch = createMockFetch({
      permissions: { Pet: ["list"] },
      roles: ["ROLE_SYSTEM_ADMIN"],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    const result = await adapter.extract("token");

    expect(result.user?.isSuperAdmin).toBe(true);
    expect(result.rules[0]).toEqual({ action: "manage", subject: "all" });
  });

  it("uses custom systemAdminRole", async () => {
    const mockFetch = createMockFetch({
      permissions: {},
      roles: ["ROLE_GOD"],
      isSuperAdmin: false,
    });

    const adapter = createSpringAccessAdapter({
      systemAdminRole: "ROLE_GOD",
      fetchFn: mockFetch,
    });
    const result = await adapter.extract("token");

    expect(result.user?.isSuperAdmin).toBe(true);
    expect(result.rules).toEqual([{ action: "manage", subject: "all" }]);
  });

  it("handles missing fields in response gracefully", async () => {
    const mockFetch = createMockFetch({});

    const adapter = createSpringAccessAdapter({ fetchFn: mockFetch });
    const result = await adapter.extract("token");

    expect(result.rules).toEqual([]);
    expect(result.roles).toEqual([]);
    expect(result.user?.isSuperAdmin).toBe(false);
  });
});
