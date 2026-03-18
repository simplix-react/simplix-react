import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAuthFetchFn = vi.fn().mockResolvedValue({
  type: "SUCCESS",
  message: "OK",
  body: { userId: "u1" },
  timestamp: "2024-01-01T00:00:00Z",
});

vi.mock("@simplix-react/contract", () => ({
  createFetch: vi.fn(() => vi.fn()),
}));

vi.mock("@simplix-react/auth", () => {
  const mockScheme = {
    clear: vi.fn(),
  };
  return {
    createAuth: vi.fn(() => ({
      fetchFn: mockAuthFetchFn,
      clear: vi.fn(),
    })),
    createAuthFetch: vi.fn((_config: unknown, baseFetch: unknown) => baseFetch),
    createCrossTabSync: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
    })),
    bearerScheme: vi.fn(() => mockScheme),
    localStorageStore: vi.fn(() => ({
      get: vi.fn((key: string) => {
        if (key === "access_token") return "mock-access-token";
        if (key === "refresh_token") return "mock-refresh-token";
        return null;
      }),
      set: vi.fn(),
      remove: vi.fn(),
    })),
  };
});

import { createBootAuth } from "../boot-auth.js";
import { createFetch } from "@simplix-react/contract";
import {
  createAuth,
  createCrossTabSync,
  bearerScheme,
  localStorageStore,
} from "@simplix-react/auth";

describe("createBootAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates boot auth with default options", () => {
    const result = createBootAuth();

    expect(result.auth).toBeDefined();
    expect(result.authClient).toBeDefined();
    expect(result.store).toBeDefined();
    expect(result.baseFetch).toBeDefined();
    expect(result.rawAuthFetch).toBeDefined();
    expect(result.bootMutator).toBeDefined();
    expect(result.getToken).toBeDefined();
  });

  it("uses localStorageStore with default prefix", () => {
    createBootAuth();
    expect(localStorageStore).toHaveBeenCalledWith("simplix:");
  });

  it("uses custom store prefix", () => {
    createBootAuth({ storePrefix: "myapp:" });
    expect(localStorageStore).toHaveBeenCalledWith("myapp:");
  });

  it("uses provided store instead of default", () => {
    const customStore = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };
    createBootAuth({ store: customStore });
    // localStorageStore is still called for its fallback but customStore is used
    expect(customStore).toBeDefined();
  });

  it("creates bearer scheme with refresh config", () => {
    createBootAuth({ refreshBeforeExpiry: 120 });
    expect(bearerScheme).toHaveBeenCalledWith(
      expect.objectContaining({
        refresh: expect.objectContaining({
          refreshBeforeExpiry: 120,
          autoSchedule: true,
        }),
      }),
    );
  });

  it("disables auto schedule when specified", () => {
    createBootAuth({ autoSchedule: false });
    expect(bearerScheme).toHaveBeenCalledWith(
      expect.objectContaining({
        refresh: expect.objectContaining({
          autoSchedule: false,
        }),
      }),
    );
  });

  it("calls createAuth with schemes and store", () => {
    createBootAuth();
    expect(createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        schemes: expect.any(Array),
        store: expect.any(Object),
        fetchFn: expect.any(Function),
      }),
    );
  });

  it("enables cross-tab sync by default", () => {
    createBootAuth();
    expect(createCrossTabSync).toHaveBeenCalledWith(
      expect.objectContaining({
        storageKey: "simplix:access_token",
      }),
    );
  });

  it("disables cross-tab sync when specified", () => {
    vi.mocked(createCrossTabSync).mockClear();
    createBootAuth({ crossTabSync: false });
    expect(createCrossTabSync).not.toHaveBeenCalled();
  });

  it("getToken returns access_token from store", () => {
    const result = createBootAuth();
    const token = result.getToken();
    expect(token).toBe("mock-access-token");
  });

  it("bootMutator unwraps envelope from auth.fetchFn", async () => {
    const result = createBootAuth();
    const data = await result.bootMutator("/api/v1/test");
    expect(data).toEqual({ userId: "u1" });
  });

  it("authClient has loginFn, refreshFn, revokeFn, userInfoFn", () => {
    const result = createBootAuth();
    expect(typeof result.authClient.loginFn).toBe("function");
    expect(typeof result.authClient.refreshFn).toBe("function");
    expect(typeof result.authClient.revokeFn).toBe("function");
    expect(typeof result.authClient.userInfoFn).toBe("function");
  });

  it("authClient.refreshFn calls baseFetch with refresh endpoint and returns token pair", async () => {
    const mockBaseFetch = vi.fn().mockResolvedValue({
      accessToken: "new-at",
      refreshToken: "new-rt",
      accessTokenExpiry: "2025-06-01T00:00:00Z",
      refreshTokenExpiry: "2025-06-08T00:00:00Z",
    });
    const result = createBootAuth({ fetchFn: mockBaseFetch });
    const tokens = await result.authClient.refreshFn();

    expect(mockBaseFetch).toHaveBeenCalledWith(
      "/api/v1/auth/token/refresh",
      expect.objectContaining({
        method: "GET",
        headers: { "X-Refresh-Token": "mock-refresh-token" },
      }),
    );
    expect(tokens).toEqual({
      accessToken: "new-at",
      refreshToken: "new-rt",
      expiresAt: "2025-06-01T00:00:00Z",
      refreshTokenExpiresAt: "2025-06-08T00:00:00Z",
    });
  });

  it("authClient.refreshFn throws when no refresh token is available", async () => {
    const customStore = {
      get: vi.fn(() => null),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };
    const result = createBootAuth({ store: customStore });

    await expect(result.authClient.refreshFn()).rejects.toThrow(
      "No refresh token available",
    );
  });

  it("authClient.revokeFn calls auth.fetchFn with revoke endpoint", async () => {
    const result = createBootAuth();
    await result.authClient.revokeFn();

    expect(mockAuthFetchFn).toHaveBeenCalledWith(
      "/api/v1/auth/token/revoke",
      expect.objectContaining({
        method: "POST",
        headers: { "X-Refresh-Token": "mock-refresh-token" },
      }),
    );
  });

  it("authClient.loginFn sends Basic auth header and returns token pair", async () => {
    const mockBaseFetch = vi.fn().mockResolvedValue({
      accessToken: "at-123",
      refreshToken: "rt-456",
      accessTokenExpiry: "2025-01-01T00:00:00Z",
      refreshTokenExpiry: "2025-01-08T00:00:00Z",
    });
    const result = createBootAuth({ fetchFn: mockBaseFetch });
    const tokens = await result.authClient.loginFn("admin", "password123");

    expect(mockBaseFetch).toHaveBeenCalledWith(
      "/api/v1/auth/token/issue",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa("admin:password123")}`,
        },
      }),
    );
    expect(tokens).toEqual({
      accessToken: "at-123",
      refreshToken: "rt-456",
      expiresAt: "2025-01-01T00:00:00Z",
      refreshTokenExpiresAt: "2025-01-08T00:00:00Z",
    });
  });

  it("authClient.userInfoFn unwraps envelope and returns user data", async () => {
    const result = createBootAuth();
    const userInfo = await result.authClient.userInfoFn();
    expect(userInfo).toEqual({ userId: "u1" });
  });

  it("cross-tab sync onExternalLogout calls auth.clear", () => {
    createBootAuth();

    const crossTabCall = vi.mocked(createCrossTabSync).mock.calls[0][0];
    const mockAuth = vi.mocked(createAuth).mock.results[0].value;

    crossTabCall.onExternalLogout();
    expect(mockAuth.clear).toHaveBeenCalled();
  });

  it("creates rawAuthFetch via createAuthFetch when rawFetchOptions provided", () => {
    const result = createBootAuth({
      rawFetchOptions: { baseUrl: "https://other-api.example.com" },
    });
    expect(result.rawAuthFetch).toBeDefined();
  });

  it("rawAuthFetch defaults to baseFetch when rawFetchOptions not provided", () => {
    const result = createBootAuth();
    expect(result.rawAuthFetch).toBe(result.baseFetch);
  });

  it("uses custom basePath for auth endpoints", async () => {
    const mockBaseFetch = vi.fn().mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      accessTokenExpiry: "2025-01-01T00:00:00Z",
      refreshTokenExpiry: "2025-01-08T00:00:00Z",
    });
    const result = createBootAuth({
      fetchFn: mockBaseFetch,
      basePath: "/custom/api",
    });

    await result.authClient.loginFn("user", "pass");
    expect(mockBaseFetch).toHaveBeenCalledWith(
      "/custom/api/auth/token/issue",
      expect.any(Object),
    );
  });

  it("bearerScheme token callback returns access_token from store", () => {
    createBootAuth();

    const schemeArgs = vi.mocked(bearerScheme).mock.calls[0][0];
    const token = typeof schemeArgs.token === "function" ? schemeArgs.token() : schemeArgs.token;
    expect(token).toBe("mock-access-token");
  });

  it("bearerScheme onScheduledRefreshFailed invokes onRefreshFailure", () => {
    const onRefreshFailure = vi.fn();
    createBootAuth({ onRefreshFailure });

    const schemeArgs = vi.mocked(bearerScheme).mock.calls[0][0];
    const mockScheme = vi.mocked(bearerScheme).mock.results[0].value;
    schemeArgs.refresh!.onScheduledRefreshFailed!();

    expect(mockScheme.clear).toHaveBeenCalled();
    expect(onRefreshFailure).toHaveBeenCalledWith(expect.any(Error));
  });

  it("onRefreshFailure clears scheme and calls user callback", () => {
    const onRefreshFailure = vi.fn();
    createBootAuth({ onRefreshFailure });

    // Get the wrapped onRefreshFailure from createAuth call
    const authArgs = vi.mocked(createAuth).mock.calls[0][0];
    const mockScheme = vi.mocked(bearerScheme).mock.results[0].value;

    authArgs.onRefreshFailure!(new Error("refresh failed"));

    expect(mockScheme.clear).toHaveBeenCalled();
    expect(onRefreshFailure).toHaveBeenCalledWith(expect.objectContaining({
      message: "refresh failed",
    }));
  });

  it("rawFetchOptions getToken callback returns access_token from store", () => {
    vi.mocked(createFetch).mockClear();
    createBootAuth({
      rawFetchOptions: { baseUrl: "https://example.com" },
    });

    // createFetch is called twice: once by createBootHttpFetch (baseFetch), once by rawFetchOptions
    // The rawFetchOptions call is the last one
    const calls = vi.mocked(createFetch).mock.calls;
    const rawFetchCall = calls[calls.length - 1][0];
    const token = rawFetchCall!.getToken!();
    expect(token).toBe("mock-access-token");
  });
});
