import { describe, it, expect } from "vitest";
import { createMockPolicy } from "../mock-policy.js";

describe("createMockPolicy", () => {
  it("returns a policy object with can method", () => {
    const policy = createMockPolicy();
    expect(typeof policy.can).toBe("function");
  });

  it("grants all permissions by default (allowAll)", () => {
    const policy = createMockPolicy();
    expect(policy.can("manage", "all")).toBe(true);
    expect(policy.can("view", "Pet")).toBe(true);
    expect(policy.can("edit", "Pet")).toBe(true);
    expect(policy.can("delete", "Order")).toBe(true);
  });

  it("uses default test user when none provided", () => {
    const policy = createMockPolicy();
    expect(policy.user).toBeDefined();
    expect(policy.user!.userId).toBe("test-user");
    expect(policy.user!.username).toBe("testuser");
  });

  it("accepts custom rules", () => {
    const policy = createMockPolicy({
      rules: [{ action: "view", subject: "Pet" }],
      allowAll: false,
    });
    expect(policy.can("view", "Pet")).toBe(true);
    expect(policy.can("edit", "Pet")).toBe(false);
  });

  it("accepts custom user", () => {
    const policy = createMockPolicy({
      user: {
        userId: "custom-user",
        username: "custom",
        roles: ["ADMIN"],
      },
    });
    expect(policy.user).toBeDefined();
    expect(policy.user!.userId).toBe("custom-user");
    expect(policy.user!.username).toBe("custom");
  });

  it("returns empty permissions when allowAll is false and no rules", () => {
    const policy = createMockPolicy({ allowAll: false });
    expect(policy.can("view", "Pet")).toBe(false);
    expect(policy.can("manage", "all")).toBe(false);
  });

  it("supports multiple rules", () => {
    const policy = createMockPolicy({
      rules: [
        { action: "view", subject: "Pet" },
        { action: "create", subject: "Pet" },
      ],
      allowAll: false,
    });
    expect(policy.can("view", "Pet")).toBe(true);
    expect(policy.can("create", "Pet")).toBe(true);
    expect(policy.can("delete", "Pet")).toBe(false);
  });
});
