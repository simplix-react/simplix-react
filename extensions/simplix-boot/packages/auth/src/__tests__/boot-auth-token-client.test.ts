import { describe, expect, it, vi } from "vitest";
import { memoryStore } from "@simplix-react/auth";
import { createBootAuth } from "../boot-auth.js";

function setup() {
  const store = memoryStore();
  store.set("access_token", "old-access");
  store.set("refresh_token", "old-refresh");
  const fetchFn = vi.fn();
  const tokenClient = {
    refresh: vi.fn(async () => ({ accessToken: "new-access", refreshToken: "new-refresh", expiresIn: 300 })),
    revoke: vi.fn(async () => {}),
  };
  const result = createBootAuth({ store, fetchFn, tokenClient, autoSchedule: false, crossTabSync: false });
  return { fetchFn, tokenClient, ...result };
}

describe("createBootAuth with an external token client", () => {
  it("refreshes through the external issuer, never the Boot token endpoint", async () => {
    const { authClient, tokenClient, fetchFn } = setup();

    const tokens = await authClient.refreshFn();

    expect(tokenClient.refresh).toHaveBeenCalledWith("old-refresh");
    expect(tokens.accessToken).toBe("new-access");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("revokes through the external issuer", async () => {
    const { authClient, tokenClient, fetchFn } = setup();

    await authClient.revokeFn();

    expect(tokenClient.revoke).toHaveBeenCalledWith("old-refresh");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("refuses a password sign-in, which belongs to the issuer", async () => {
    const { authClient, fetchFn } = setup();

    await expect(authClient.loginFn("someone", "secret")).rejects.toThrow("external issuer");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
