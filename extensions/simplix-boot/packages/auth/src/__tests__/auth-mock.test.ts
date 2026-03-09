import { describe, expect, it } from "vitest";

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
