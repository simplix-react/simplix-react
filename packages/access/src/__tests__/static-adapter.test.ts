import { describe, it, expect } from "vitest";
import { createStaticAdapter } from "../adapters/static-adapter.js";
import type { AccessRule, AccessUser } from "../types.js";

const testUser: AccessUser = {
  userId: "user-1",
  username: "john",
  roles: ["ROLE_ADMIN"],
};

describe("createStaticAdapter", () => {
  it("returns the given rules on extract", async () => {
    const rules: AccessRule[] = [
      { action: "view", subject: "Pet" },
      { action: "create", subject: "Order" },
    ];
    const adapter = createStaticAdapter(rules);

    const result = await adapter.extract(null);

    expect(result.rules).toEqual(rules);
  });

  it("returns the given user on extract", async () => {
    const adapter = createStaticAdapter([], testUser);

    const result = await adapter.extract(null);

    expect(result.user).toEqual(testUser);
    expect(result.roles).toEqual(["ROLE_ADMIN"]);
  });

  it("returns empty roles when no user is provided", async () => {
    const adapter = createStaticAdapter([]);

    const result = await adapter.extract(null);

    expect(result.user).toBeUndefined();
    expect(result.roles).toEqual([]);
  });

  it("ignores the authData argument", async () => {
    const rules: AccessRule[] = [{ action: "view", subject: "Pet" }];
    const adapter = createStaticAdapter(rules, testUser);

    const result1 = await adapter.extract("some-token");
    const result2 = await adapter.extract(undefined);
    const result3 = await adapter.extract({ arbitrary: true });

    expect(result1.rules).toEqual(rules);
    expect(result2.rules).toEqual(rules);
    expect(result3.rules).toEqual(rules);
  });

  it("handles empty rules array", async () => {
    const adapter = createStaticAdapter([]);

    const result = await adapter.extract(null);

    expect(result.rules).toEqual([]);
  });

  it("derives roles from user.roles", async () => {
    const user: AccessUser = {
      userId: "u-1",
      username: "alice",
      roles: ["ROLE_USER", "ROLE_EDITOR"],
    };
    const adapter = createStaticAdapter([], user);

    const result = await adapter.extract(null);

    expect(result.roles).toEqual(["ROLE_USER", "ROLE_EDITOR"]);
  });
});
