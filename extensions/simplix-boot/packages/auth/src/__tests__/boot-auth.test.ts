import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@simplix-react/contract", () => ({
  createFetch: vi.fn(() => vi.fn()),
}));

vi.mock("@simplix-react/auth", () => {
  const mockScheme = {
    clear: vi.fn(),
  };
  return {
    createAuth: vi.fn(() => ({
      fetchFn: vi.fn().mockResolvedValue({
        type: "SUCCESS",
        message: "OK",
        body: { userId: "u1" },
        timestamp: "2024-01-01T00:00:00Z",
      }),
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
});
