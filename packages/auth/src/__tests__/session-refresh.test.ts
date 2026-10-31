import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bearerScheme } from "../schemes/bearer-scheme.js";
import { createAuth } from "../create-auth.js";
import { memoryStore } from "../stores/memory-store.js";
import { AuthError } from "../errors.js";
import type { ActivitySource, RefreshLock, TokenPair, TokenStore } from "../types.js";

/** An activity source the test moves by hand. */
function fakeActivity(): ActivitySource & { touch(): void } {
  let last = Date.now();
  const listeners = new Set<() => void>();
  return {
    lastActivityAt: () => last,
    onActivity(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    touch() {
      last = Date.now();
      for (const listener of [...listeners]) listener();
    },
  };
}

/** One lock shared by every "tab", standing in for the Web Locks API. */
function sharedLock(): RefreshLock {
  let tail: Promise<unknown> = Promise.resolve();
  return (_name, run) => {
    const next = tail.then(run, run);
    tail = next.catch(() => undefined);
    return next;
  };
}

function issuer() {
  let n = 0;
  return vi.fn(async (): Promise<TokenPair> => {
    n += 1;
    await Promise.resolve();
    return { accessToken: `access-${n}`, refreshToken: `refresh-${n}`, expiresIn: 300 };
  });
}

describe("session refresh", () => {
  let store: TokenStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = memoryStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("refreshes ahead of expiry after a sign-in that stored the tokens, while the user is active", async () => {
    const refreshFn = issuer();
    const activity = fakeActivity();
    const scheme = bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: { refreshFn, refreshBeforeExpiry: 60, autoSchedule: true, activity },
    });
    const auth = createAuth({ schemes: [scheme], store });

    // Signed in on this page, with no reload: the scheme was built before any token existed.
    auth.setTokens({ accessToken: "a0", refreshToken: "r0", expiresIn: 300 });
    await vi.advanceTimersByTimeAsync(200_000);
    activity.touch();
    await vi.advanceTimersByTimeAsync(41_000);

    expect(refreshFn).toHaveBeenCalledOnce();
    expect(store.get("access_token")).toBe("access-1");
    scheme.clear();
  });

  it("holds the refresh while nobody is active and makes it on the next activity", async () => {
    const refreshFn = issuer();
    const activity = fakeActivity();
    const scheme = bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: { refreshFn, refreshBeforeExpiry: 60, autoSchedule: true, activity },
    });
    const auth = createAuth({ schemes: [scheme], store });
    auth.setTokens({ accessToken: "a0", refreshToken: "r0", expiresIn: 300 });

    await vi.advanceTimersByTimeAsync(600_000);
    expect(refreshFn).not.toHaveBeenCalled();

    activity.touch();
    await vi.advanceTimersByTimeAsync(0);
    expect(refreshFn).toHaveBeenCalledOnce();
    expect(store.get("access_token")).toBe("access-1");
    scheme.clear();
  });

  it("makes one refresh call when two tabs sharing the store refresh together", async () => {
    const refreshFn = issuer();
    const lock = sharedLock();
    store.set("access_token", "a0");
    store.set("refresh_token", "r0");
    store.set("expires_at", String(Date.now() + 10_000));
    const tab = () =>
      bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn, refreshBeforeExpiry: 60, lock, lockName: "app:refresh" },
      });
    const one = tab();
    const two = tab();

    await Promise.all([one.refresh!(), two.refresh!(), one.getHeaders(), two.getHeaders()]);

    expect(refreshFn).toHaveBeenCalledOnce();
    expect(store.get("refresh_token")).toBe("refresh-1");
    expect(await two.getHeaders()).toEqual({ Authorization: "Bearer access-1" });
  });

  it("retries a scheduled refresh the network dropped instead of ending the session", async () => {
    const refreshFn = vi
      .fn<() => Promise<TokenPair>>()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue({ accessToken: "a1", refreshToken: "r1", expiresIn: 300 });
    const onScheduledRefreshFailed = vi.fn();
    store.set("access_token", "a0");
    store.set("refresh_token", "r0");
    store.set("expires_at", String(Date.now() + 1_000));
    const scheme = bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: { refreshFn, refreshBeforeExpiry: 60, autoSchedule: true, onScheduledRefreshFailed },
    });

    await vi.advanceTimersByTimeAsync(31_000);

    expect(onScheduledRefreshFailed).not.toHaveBeenCalled();
    expect(refreshFn).toHaveBeenCalledTimes(2);
    expect(store.get("access_token")).toBe("a1");
    scheme.clear();
  });

  it("ends the session when the issuer refuses the scheduled refresh", async () => {
    const refusal = new AuthError("REFRESH_FAILED", "refused", {
      issuerError: { error: "invalid_grant", description: "Session not active" },
    });
    const refreshFn = vi.fn<() => Promise<TokenPair>>().mockRejectedValue(refusal);
    const onScheduledRefreshFailed = vi.fn();
    store.set("access_token", "a0");
    store.set("refresh_token", "r0");
    store.set("expires_at", String(Date.now() + 1_000));
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: { refreshFn, refreshBeforeExpiry: 60, autoSchedule: true, onScheduledRefreshFailed },
    });

    await vi.advanceTimersByTimeAsync(1_000);

    expect(onScheduledRefreshFailed).toHaveBeenCalledWith(refusal);
  });
});
