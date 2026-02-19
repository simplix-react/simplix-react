import { describe, expect, it } from "vitest";

import { convertSpringPermissionsToCasl } from "../convert-permissions.js";

describe("convertSpringPermissionsToCasl", () => {
  it("converts permission map to CASL rules", () => {
    const result = convertSpringPermissionsToCasl({
      permissions: { Pet: ["list", "view"], Order: ["list"] },
      roles: ["ROLE_USER"],
      isSuperAdmin: false,
    });

    expect(result.rules).toEqual([
      { action: "list", subject: "Pet" },
      { action: "view", subject: "Pet" },
      { action: "list", subject: "Order" },
    ]);
    expect(result.roles).toEqual(["ROLE_USER"]);
    expect(result.isSuperAdmin).toBe(false);
  });

  it("normalizes mixed string/object roles", () => {
    const result = convertSpringPermissionsToCasl({
      permissions: {},
      roles: [
        "ROLE_USER",
        { roleCode: "ROLE_ADMIN", roleName: "Admin" },
      ],
      isSuperAdmin: false,
    });

    expect(result.roles).toEqual(["ROLE_USER", "ROLE_ADMIN"]);
  });

  it("prepends manage-all rule when isSuperAdmin is true", () => {
    const result = convertSpringPermissionsToCasl({
      permissions: { Pet: ["list"] },
      roles: ["ROLE_ADMIN"],
      isSuperAdmin: true,
    });

    expect(result.rules[0]).toEqual({ action: "manage", subject: "all" });
    expect(result.isSuperAdmin).toBe(true);
  });

  it('treats isSuperAdmin string "true" as boolean true', () => {
    const result = convertSpringPermissionsToCasl({
      permissions: {},
      roles: [],
      isSuperAdmin: "true",
    });

    expect(result.isSuperAdmin).toBe(true);
    expect(result.rules).toEqual([{ action: "manage", subject: "all" }]);
  });

  it('treats isSuperAdmin string "false" as boolean false', () => {
    const result = convertSpringPermissionsToCasl({
      permissions: {},
      roles: [],
      isSuperAdmin: "false",
    });

    expect(result.isSuperAdmin).toBe(false);
    expect(result.rules).toEqual([]);
  });

  it("handles empty permissions and roles", () => {
    const result = convertSpringPermissionsToCasl({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    expect(result.rules).toEqual([]);
    expect(result.roles).toEqual([]);
    expect(result.isSuperAdmin).toBe(false);
  });
});
