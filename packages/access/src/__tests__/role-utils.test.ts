import { describe, it, expect } from "vitest";
import {
  normalizeRole,
  normalizeRoles,
  hasRole,
  hasAnyRole,
} from "../helpers/role-utils.js";

describe("normalizeRole", () => {
  it("adds ROLE_ prefix to plain role name", () => {
    expect(normalizeRole("ADMIN")).toBe("ROLE_ADMIN");
  });

  it("does not double-prefix an already prefixed role", () => {
    expect(normalizeRole("ROLE_ADMIN")).toBe("ROLE_ADMIN");
  });

  it("handles lowercase role names", () => {
    expect(normalizeRole("user")).toBe("ROLE_user");
  });
});

describe("hasRole", () => {
  it("matches role with ROLE_ prefix in list", () => {
    expect(hasRole(["ROLE_ADMIN", "ROLE_USER"], "ADMIN")).toBe(true);
  });

  it("matches role without prefix when list has prefix", () => {
    expect(hasRole(["ROLE_ADMIN"], "ROLE_ADMIN")).toBe(true);
  });

  it("matches role with prefix when list has no prefix", () => {
    expect(hasRole(["ADMIN"], "ROLE_ADMIN")).toBe(true);
  });

  it("returns false when role is not in list", () => {
    expect(hasRole(["ROLE_USER"], "ADMIN")).toBe(false);
  });

  it("returns false for empty roles list", () => {
    expect(hasRole([], "ADMIN")).toBe(false);
  });
});

describe("hasAnyRole", () => {
  it("returns true if at least one role matches", () => {
    expect(hasAnyRole(["ROLE_USER"], ["ADMIN", "USER"])).toBe(true);
  });

  it("returns false if no roles match", () => {
    expect(hasAnyRole(["ROLE_USER"], ["ADMIN", "MANAGER"])).toBe(false);
  });

  it("returns false for empty target roles", () => {
    expect(hasAnyRole(["ROLE_USER"], [])).toBe(false);
  });

  it("returns false for empty roles list", () => {
    expect(hasAnyRole([], ["ADMIN"])).toBe(false);
  });
});

describe("normalizeRoles", () => {
  it("handles string array input", () => {
    expect(normalizeRoles(["ADMIN", "USER"])).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with roleCode", () => {
    expect(
      normalizeRoles([{ roleCode: "ADMIN" }, { roleCode: "USER" }]),
    ).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with roleName", () => {
    expect(
      normalizeRoles([{ roleName: "ADMIN" }, { roleName: "USER" }]),
    ).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with name", () => {
    expect(normalizeRoles([{ name: "ADMIN" }, { name: "USER" }])).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("handles mixed inputs (strings + objects)", () => {
    expect(
      normalizeRoles(["ADMIN", { roleCode: "USER" }, { name: "MANAGER" }]),
    ).toEqual(["ADMIN", "USER", "MANAGER"]);
  });

  it("filters out empty objects", () => {
    expect(normalizeRoles([{ roleCode: "ADMIN" }, {}, "USER"])).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("prefers roleCode over roleName and name", () => {
    expect(
      normalizeRoles([{ roleCode: "A", roleName: "B", name: "C" }]),
    ).toEqual(["A"]);
  });

  it("falls back to roleName when roleCode is missing", () => {
    expect(normalizeRoles([{ roleName: "B", name: "C" }])).toEqual(["B"]);
  });
});
