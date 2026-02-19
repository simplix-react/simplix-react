import { describe, expect, it } from "vitest";

import { checkSuperAdmin } from "../helpers/super-admin.js";
import type { AccessUser } from "../types.js";

function createUser(overrides: Partial<AccessUser> = {}): AccessUser {
  return {
    userId: "user-1",
    username: "test",
    roles: [],
    ...overrides,
  };
}

describe("checkSuperAdmin", () => {
  it("returns true when isSuperAdmin is true", () => {
    expect(checkSuperAdmin(createUser({ isSuperAdmin: true }))).toBe(true);
  });

  it("returns false when isSuperAdmin is false", () => {
    expect(checkSuperAdmin(createUser({ isSuperAdmin: false }))).toBe(false);
  });

  it('returns true when isSuperAdmin is string "true"', () => {
    const user = createUser();
    // Simulate Spring Security returning string "true"
    (user as unknown as Record<string, unknown>).isSuperAdmin = "true";
    expect(checkSuperAdmin(user)).toBe(true);
  });

  it('returns false when isSuperAdmin is string "false"', () => {
    const user = createUser();
    (user as unknown as Record<string, unknown>).isSuperAdmin = "false";
    expect(checkSuperAdmin(user)).toBe(false);
  });

  it("returns false when isSuperAdmin is undefined", () => {
    expect(checkSuperAdmin(createUser())).toBe(false);
  });

  it("uses custom checker when provided", () => {
    const checker = (u: AccessUser) => u.roles.includes("ROLE_SYSTEM_ADMIN");
    expect(
      checkSuperAdmin(createUser({ roles: ["ROLE_SYSTEM_ADMIN"] }), checker),
    ).toBe(true);
    expect(checkSuperAdmin(createUser({ roles: ["ROLE_USER"] }), checker)).toBe(
      false,
    );
  });
});
