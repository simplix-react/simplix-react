// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createSelfAccessPolicy, currentSelfAccessRefusal, useSelfAccessRefusal } from "../self-access-policy";

const GRANTS = {
  body: {
    userId: "u-1",
    username: "operator",
    displayName: "Kim",
    isSuperAdmin: false,
    roles: [{ roleCode: "ROLE_BILLING" }],
    permissions: { INVOICE: ["view", "list"] },
  },
};

function refused(status: number, body: unknown) {
  return Object.assign(new Error("refused"), { status, body: JSON.stringify(body) });
}

describe("createSelfAccessPolicy", () => {
  it("carries the user and the role codes across, so a route guard has someone to read", async () => {
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => Promise.resolve(GRANTS) });
    await policy.update("token");
    expect(policy.user).toMatchObject({ userId: "u-1", username: "operator", displayName: "Kim", roles: ["ROLE_BILLING"] });
    expect(policy.roles).toEqual(["ROLE_BILLING"]);
    expect(policy.can("view", "INVOICE")).toBe(true);
    expect(policy.can("edit", "INVOICE")).toBe(false);
  });

  it("reads a bare answer as well as an enveloped one", async () => {
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => Promise.resolve(GRANTS.body) });
    await policy.update("token");
    expect(policy.user).toMatchObject({ userId: "u-1" });
  });
});

describe("currentSelfAccessRefusal", () => {
  it("names the status and error code of a refused self read, and clears on the next answer", async () => {
    let answer: () => Promise<unknown> = () => Promise.reject(refused(409, { errorCode: "CODE_A" }));
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => answer() });

    await policy.update("token").catch(() => undefined);
    expect(currentSelfAccessRefusal()).toEqual({ status: 409, errorCode: "CODE_A" });

    answer = () => Promise.resolve(GRANTS);
    await policy.update("token");
    expect(currentSelfAccessRefusal()).toBeNull();
  });

  it("reads the code from an envelope-aware error's own field", async () => {
    const error = Object.assign(new Error("refused"), { status: 409, errorCode: "CODE_B" });
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => Promise.reject(error) });

    await policy.update("token").catch(() => undefined);
    expect(currentSelfAccessRefusal()).toEqual({ status: 409, errorCode: "CODE_B" });
  });
});

describe("useSelfAccessRefusal", () => {
  it("redraws when the self read is refused and when it is answered again", async () => {
    let answer: () => Promise<unknown> = () => Promise.resolve(GRANTS);
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => answer() });
    await policy.update("token");
    const { result } = renderHook(() => useSelfAccessRefusal());
    expect(result.current).toBeNull();

    answer = () => Promise.reject(refused(403, { errorCode: "CODE_C" }));
    await act(async () => {
      await policy.update("token").catch(() => undefined);
    });
    expect(result.current).toEqual({ status: 403, errorCode: "CODE_C" });

    answer = () => Promise.resolve(GRANTS);
    await act(async () => {
      await policy.update("token");
    });
    expect(result.current).toBeNull();
  });
});
