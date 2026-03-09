import { describe, expect, it } from "vitest";

import {
  loginInputSchema,
  permissionsSchema,
  roleSchema,
  tokenResponseSchema,
  userProfileSchema,
} from "../schemas.js";

describe("loginInputSchema", () => {
  it("validates valid login input", () => {
    const data = { username: "admin", password: "secret" };
    const result = loginInputSchema.parse(data);
    expect(result.username).toBe("admin");
    expect(result.password).toBe("secret");
  });

  it("rejects missing username", () => {
    expect(() => loginInputSchema.parse({ password: "secret" })).toThrow();
  });

  it("rejects missing password", () => {
    expect(() => loginInputSchema.parse({ username: "admin" })).toThrow();
  });
});

describe("tokenResponseSchema", () => {
  it("validates valid token response", () => {
    const data = {
      accessToken: "at-123",
      refreshToken: "rt-456",
      accessTokenExpiry: "2024-01-01T01:00:00Z",
      refreshTokenExpiry: "2024-01-08T00:00:00Z",
    };
    const result = tokenResponseSchema.parse(data);
    expect(result.accessToken).toBe("at-123");
    expect(result.refreshToken).toBe("rt-456");
  });

  it("rejects missing accessToken", () => {
    const data = {
      refreshToken: "rt-456",
      accessTokenExpiry: "2024-01-01T01:00:00Z",
      refreshTokenExpiry: "2024-01-08T00:00:00Z",
    };
    expect(() => tokenResponseSchema.parse(data)).toThrow();
  });
});

describe("roleSchema", () => {
  it("validates string role", () => {
    expect(roleSchema.parse("ROLE_USER")).toBe("ROLE_USER");
  });

  it("validates object role", () => {
    const role = { roleCode: "ROLE_ADMIN", roleName: "Admin" };
    const result = roleSchema.parse(role);
    expect(result).toEqual(role);
  });

  it("rejects number", () => {
    expect(() => roleSchema.parse(123)).toThrow();
  });

  it("rejects object with missing roleName", () => {
    expect(() => roleSchema.parse({ roleCode: "ROLE_ADMIN" })).toThrow();
  });
});

describe("userProfileSchema", () => {
  it("validates valid user profile", () => {
    const data = {
      userId: "u1",
      username: "admin",
      displayName: "Admin User",
      email: "admin@example.com",
      roles: ["ROLE_ADMIN"],
      isSuperAdmin: true,
    };
    const result = userProfileSchema.parse(data);
    expect(result.userId).toBe("u1");
    expect(result.isSuperAdmin).toBe(true);
  });

  it("validates user profile with object roles", () => {
    const data = {
      userId: "u2",
      username: "user",
      displayName: "User",
      email: "user@example.com",
      roles: [{ roleCode: "ROLE_USER", roleName: "User" }],
      isSuperAdmin: false,
    };
    const result = userProfileSchema.parse(data);
    expect(result.roles).toHaveLength(1);
  });

  it("validates user profile with mixed roles", () => {
    const data = {
      userId: "u3",
      username: "mixed",
      displayName: "Mixed",
      email: "mixed@example.com",
      roles: [
        "ROLE_USER",
        { roleCode: "ROLE_ADMIN", roleName: "Admin" },
      ],
      isSuperAdmin: false,
    };
    const result = userProfileSchema.parse(data);
    expect(result.roles).toHaveLength(2);
  });

  it("rejects missing required fields", () => {
    expect(() => userProfileSchema.parse({ userId: "u1" })).toThrow();
  });
});

describe("permissionsSchema", () => {
  it("validates valid permissions response", () => {
    const data = {
      permissions: {
        Pet: ["list", "view", "create"],
        Order: ["list"],
      },
      roles: ["ROLE_USER"],
      isSuperAdmin: false,
    };
    const result = permissionsSchema.parse(data);
    expect(result.permissions["Pet"]).toEqual(["list", "view", "create"]);
    expect(result.roles).toEqual(["ROLE_USER"]);
  });

  it("validates empty permissions", () => {
    const data = {
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    };
    const result = permissionsSchema.parse(data);
    expect(result.permissions).toEqual({});
    expect(result.roles).toEqual([]);
  });

  it("validates permissions with object roles", () => {
    const data = {
      permissions: { Pet: ["list"] },
      roles: [{ roleCode: "ROLE_USER", roleName: "User" }],
      isSuperAdmin: true,
    };
    const result = permissionsSchema.parse(data);
    expect(result.isSuperAdmin).toBe(true);
  });

  it("rejects invalid permissions structure", () => {
    const data = {
      permissions: { Pet: "list" },
      roles: [],
      isSuperAdmin: false,
    };
    expect(() => permissionsSchema.parse(data)).toThrow();
  });
});
