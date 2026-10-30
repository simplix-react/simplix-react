import { describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/contract", () => ({
  createFetch: vi.fn(() => vi.fn()),
}));

vi.mock("@simplix-react/auth", () => ({
  createAuth: vi.fn(() => ({ fetchFn: vi.fn(), clear: vi.fn() })),
  createAuthFetch: vi.fn((_config: unknown, baseFetch: unknown) => baseFetch),
  createCrossTabSync: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  bearerScheme: vi.fn(() => ({ clear: vi.fn() })),
  localStorageStore: vi.fn(() => ({ get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() })),
}));

import { setRequestLocale } from "@simplix-react/api";
import { createBootAuth } from "../boot-auth.js";

// Kept apart from boot-auth.test.ts: the request locale is module state with no way back to
// unset, so setting it there would change what every later login in that file sends.
describe("createBootAuth sign-in locale", () => {
  it("sends the request locale with the sign-in request", async () => {
    setRequestLocale("en");
    const baseFetch = vi.fn().mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      accessTokenExpiry: "2025-01-01T00:00:00Z",
      refreshTokenExpiry: "2025-01-08T00:00:00Z",
    });

    await createBootAuth({ fetchFn: baseFetch }).authClient.loginFn("admin", "secret");

    expect(baseFetch).toHaveBeenCalledWith(
      "/api/v1/auth/token/issue",
      expect.objectContaining({
        headers: {
          Authorization: `Basic ${btoa("admin:secret")}`,
          "Accept-Language": "en",
        },
      }),
    );
  });
});
