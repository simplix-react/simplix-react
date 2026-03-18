import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { createAuthMock } from "../mock/auth-mock.js";
import type { MockUserProfile } from "../mock/auth-mock.js";

const testUsers: Record<string, MockUserProfile> = {
  admin: {
    user: {
      userId: "u1",
      username: "admin",
      displayName: "Admin User",
      email: "admin@example.com",
      roles: [{ roleCode: "ROLE_ADMIN", roleName: "Admin" }],
      isSuperAdmin: true,
    },
    permissions: {
      permissions: { Pet: ["list", "view", "create", "update", "delete"] },
      roles: [{ roleCode: "ROLE_ADMIN", roleName: "Admin" }],
      isSuperAdmin: true,
    },
    password: "admin123",
  },
  viewer: {
    user: {
      userId: "u2",
      username: "viewer",
      displayName: "Viewer User",
      email: "viewer@example.com",
      roles: [{ roleCode: "ROLE_VIEWER", roleName: "Viewer" }],
      isSuperAdmin: false,
    },
    permissions: {
      permissions: { Pet: ["list", "view"] },
      roles: [{ roleCode: "ROLE_VIEWER", roleName: "Viewer" }],
      isSuperAdmin: false,
    },
    password: "viewer123",
  },
};

describe("createAuthMock", () => {
  it("returns a MockDomainConfig with name and handlers", () => {
    const config = createAuthMock({ users: testUsers });

    expect(config.name).toBe("auth");
    expect(config.handlers).toBeDefined();
    expect(config.handlers.length).toBeGreaterThan(0);
  });

  it("creates handlers for all auth endpoints", () => {
    const config = createAuthMock({ users: testUsers });

    // Should have handlers for:
    // token/issue, token/refresh, token/revoke, user/me, user/me/permissions, public/user/permissions
    expect(config.handlers).toHaveLength(6);
  });

  it("uses default basePath", () => {
    const config = createAuthMock({ users: testUsers });
    expect(config.handlers.length).toBe(6);
  });

  it("uses custom basePath", () => {
    const config = createAuthMock({
      basePath: "/custom/api",
      users: testUsers,
    });
    expect(config.handlers.length).toBe(6);
  });
});

describe("createAuthMock handlers", () => {
  const BASE = "http://test.local";
  const _config = createAuthMock({ basePath: `${BASE}/api/v1`, users: testUsers });

  // Recreate with full URL base so MSW can match requests
  const _configWithBase = createAuthMock({
    basePath: "/api/v1",
    users: testUsers,
  });
  // MSW relative path handlers need to be tested via a server with full URLs
  // Use basePath with full URL for handler matching
  const fullUrlConfig = createAuthMock({
    basePath: `${BASE}/api/v1`,
    users: testUsers,
  });
  const server = setupServer(...(fullUrlConfig.handlers as Parameters<typeof setupServer>));

  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("token/issue", () => {
    it("returns token for valid credentials", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/issue`, {
        headers: { Authorization: `Basic ${btoa("admin:admin123")}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.accessToken).toContain("mock-access-admin");
      expect(body.refreshToken).toContain("mock-refresh-admin");
      expect(body.accessTokenExpiry).toBeDefined();
      expect(body.refreshTokenExpiry).toBeDefined();
    });

    it("returns 401 for missing Authorization header", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/issue`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for wrong password", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/issue`, {
        headers: { Authorization: `Basic ${btoa("admin:wrong")}` },
      });
      expect(res.status).toBe(401);
    });

    it("returns 401 for unknown user", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/issue`, {
        headers: { Authorization: `Basic ${btoa("nobody:pass")}` },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("token/refresh", () => {
    it("returns new tokens", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/refresh`, {
        headers: { Authorization: "Bearer mock-access-admin-12345" },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.accessToken).toContain("mock-access-admin");
    });

    it("defaults to admin username when no bearer token", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/refresh`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.accessToken).toContain("mock-access-admin");
    });
  });

  describe("token/revoke", () => {
    it("returns 204", async () => {
      const res = await fetch(`${BASE}/api/v1/auth/token/revoke`, {
        method: "POST",
      });
      expect(res.status).toBe(204);
    });
  });

  describe("user/me", () => {
    it("returns user profile for valid token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me`, {
        headers: { Authorization: "Bearer mock-access-admin-12345" },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.body.username).toBe("admin");
      expect(body.type).toBe("SUCCESS");
    });

    it("returns 401 for missing token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for unknown user token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me`, {
        headers: { Authorization: "Bearer mock-access-unknown-12345" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("user/me/permissions", () => {
    it("returns permissions for valid token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me/permissions`, {
        headers: { Authorization: "Bearer mock-access-admin-12345" },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.body.permissions).toEqual({
        Pet: ["list", "view", "create", "update", "delete"],
      });
    });

    it("returns 401 for missing token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me/permissions`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for unknown user token", async () => {
      const res = await fetch(`${BASE}/api/v1/user/me/permissions`, {
        headers: { Authorization: "Bearer mock-access-unknown-12345" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("public/user/permissions", () => {
    it("returns empty permissions without auth", async () => {
      const res = await fetch(`${BASE}/api/v1/public/user/permissions`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.body.permissions).toEqual({});
      expect(body.body.roles).toEqual([]);
      expect(body.body.isSuperAdmin).toBe(false);
    });
  });
});
