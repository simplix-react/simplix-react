import type { AccessRule } from "@simplix-react/access";
import { describe, expect, it } from "vitest";

import { hasBackofficeAccess } from "../backoffice-guard.js";

type WideRule = AccessRule<string, string>;

describe("hasBackofficeAccess", () => {
  it("returns true when isSuperAdmin is true", () => {
    expect(hasBackofficeAccess([], true)).toBe(true);
  });

  it("returns true when rules contain BACKOFFICE_ACCESS", () => {
    const rules: WideRule[] = [
      { action: "view", subject: "BACKOFFICE_ACCESS" },
    ];
    expect(hasBackofficeAccess(rules)).toBe(true);
  });

  it("returns true when rules contain manage-all", () => {
    const rules: WideRule[] = [
      { action: "manage", subject: "all" },
    ];
    expect(hasBackofficeAccess(rules)).toBe(true);
  });

  it("returns false when no matching rules exist", () => {
    const rules: WideRule[] = [
      { action: "list", subject: "Pet" },
      { action: "view", subject: "Order" },
    ];
    expect(hasBackofficeAccess(rules)).toBe(false);
  });

  it("uses custom resource name", () => {
    const rules: WideRule[] = [
      { action: "view", subject: "ADMIN_PANEL" },
    ];
    expect(hasBackofficeAccess(rules, false, "ADMIN_PANEL")).toBe(true);
    expect(hasBackofficeAccess(rules, false, "BACKOFFICE_ACCESS")).toBe(false);
  });

  it("returns false for empty rules and non-super-admin", () => {
    expect(hasBackofficeAccess([])).toBe(false);
    expect(hasBackofficeAccess([], false)).toBe(false);
  });
});
