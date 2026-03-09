import { describe, it, expect } from "vitest";
import { resolveRole } from "../helpers/resolve-role.js";
import type { EntityOperationDef } from "../types.js";

describe("resolveRole", () => {
  const baseOp: EntityOperationDef = { method: "GET", path: "/items" };

  it("returns explicit role when provided", () => {
    expect(resolveRole("fetchAll", { ...baseOp, role: "list" })).toBe("list");
  });

  it("infers 'list' from operation name", () => {
    expect(resolveRole("list", baseOp)).toBe("list");
  });

  it("infers 'get' from operation name", () => {
    expect(resolveRole("get", { method: "GET", path: "/items/:id" })).toBe("get");
  });

  it("infers 'create' from operation name", () => {
    expect(resolveRole("create", { method: "POST", path: "/items" })).toBe("create");
  });

  it("infers 'update' from operation name", () => {
    expect(resolveRole("update", { method: "PATCH", path: "/items/:id" })).toBe("update");
  });

  it("infers 'delete' from operation name", () => {
    expect(resolveRole("delete", { method: "DELETE", path: "/items/:id" })).toBe("delete");
  });

  it("infers 'tree' from operation name", () => {
    expect(resolveRole("tree", { method: "GET", path: "/categories/tree" })).toBe("tree");
  });

  it("returns undefined for custom operation names", () => {
    expect(resolveRole("archive", { method: "POST", path: "/items/:id/archive" })).toBeUndefined();
  });

  it("returns undefined for unknown names without role", () => {
    expect(resolveRole("bulkDelete", { method: "POST", path: "/items/bulk" })).toBeUndefined();
  });

  it("explicit role takes precedence over name-based inference", () => {
    expect(resolveRole("list", { ...baseOp, role: "get" })).toBe("get");
  });
});
