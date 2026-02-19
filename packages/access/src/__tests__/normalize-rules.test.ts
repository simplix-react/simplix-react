import { describe, it, expect } from "vitest";
import {
  normalizePermissionMap,
  normalizeFlatPermissions,
  normalizeScopePermissions,
} from "../helpers/normalize-rules.js";

describe("normalizePermissionMap", () => {
  it("converts a permission map to CASL rules", () => {
    const result = normalizePermissionMap({
      Pet: ["list", "view"],
      Order: ["create"],
    });

    expect(result).toEqual([
      { action: "list", subject: "Pet" },
      { action: "view", subject: "Pet" },
      { action: "create", subject: "Order" },
    ]);
  });

  it("returns empty array for empty map", () => {
    expect(normalizePermissionMap({})).toEqual([]);
  });

  it("handles resources with empty action arrays", () => {
    expect(normalizePermissionMap({ Pet: [] })).toEqual([]);
  });
});

describe("normalizeFlatPermissions", () => {
  it("converts colon-separated permissions to CASL rules", () => {
    const result = normalizeFlatPermissions(["PET:list", "PET:view"]);

    expect(result).toEqual([
      { action: "list", subject: "PET" },
      { action: "view", subject: "PET" },
    ]);
  });

  it("treats strings without separator as manage:subject", () => {
    const result = normalizeFlatPermissions(["ROLE_ADMIN"]);

    expect(result).toEqual([{ action: "manage", subject: "ROLE_ADMIN" }]);
  });

  it("supports custom separator", () => {
    const result = normalizeFlatPermissions(["PET.list", "PET.view"], ".");

    expect(result).toEqual([
      { action: "list", subject: "PET" },
      { action: "view", subject: "PET" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(normalizeFlatPermissions([])).toEqual([]);
  });

  it("splits on first separator only", () => {
    const result = normalizeFlatPermissions(["A:B:C"]);
    expect(result).toEqual([{ action: "B:C", subject: "A" }]);
  });
});

describe("normalizeScopePermissions", () => {
  it("converts space-delimited scopes to CASL rules", () => {
    const result = normalizeScopePermissions("pet:read pet:write");

    expect(result).toEqual([
      { action: "read", subject: "pet" },
      { action: "write", subject: "pet" },
    ]);
  });

  it("handles multiple spaces and leading/trailing whitespace", () => {
    const result = normalizeScopePermissions("  pet:read   order:write  ");

    expect(result).toEqual([
      { action: "read", subject: "pet" },
      { action: "write", subject: "order" },
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(normalizeScopePermissions("")).toEqual([]);
  });

  it("supports custom separator", () => {
    const result = normalizeScopePermissions("pet.read pet.write", ".");

    expect(result).toEqual([
      { action: "read", subject: "pet" },
      { action: "write", subject: "pet" },
    ]);
  });
});
