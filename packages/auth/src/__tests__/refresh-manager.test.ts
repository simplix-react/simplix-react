import { describe, it, expect, vi } from "vitest";
import { RefreshManager } from "../helpers/refresh-manager.js";
import { AuthError } from "../errors.js";
import type { AuthScheme } from "../types.js";

function createMockScheme(
  overrides: Partial<AuthScheme> = {},
): AuthScheme {
  return {
    name: "mock",
    getHeaders: vi.fn().mockResolvedValue({}),
    isAuthenticated: vi.fn().mockReturnValue(false),
    clear: vi.fn(),
    ...overrides,
  };
}

describe("RefreshManager", () => {
  it("calls refresh on a scheme that supports it", async () => {
    const refreshFn = vi.fn().mockResolvedValue(undefined);
    const scheme = createMockScheme({ refresh: refreshFn });
    const manager = new RefreshManager([scheme]);

    await manager.refresh();
    expect(refreshFn).toHaveBeenCalledOnce();
  });

  it("throws when no schemes support refresh", async () => {
    const scheme = createMockScheme();
    const manager = new RefreshManager([scheme]);

    await expect(manager.refresh()).rejects.toThrow(AuthError);
    await expect(manager.refresh()).rejects.toMatchObject({
      code: "REFRESH_FAILED",
      message: "No schemes support token refresh",
    });
  });

  it("deduplicates concurrent refresh calls (single-flight)", async () => {
    let resolveRefresh!: () => void;
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    const refreshFn = vi.fn().mockReturnValue(refreshPromise);
    const scheme = createMockScheme({ refresh: refreshFn });
    const manager = new RefreshManager([scheme]);

    // Start two concurrent refreshes
    const p1 = manager.refresh();
    const p2 = manager.refresh();

    resolveRefresh();
    await Promise.all([p1, p2]);

    // refresh should only be called once
    expect(refreshFn).toHaveBeenCalledOnce();
  });

  it("allows new refresh after previous one completes", async () => {
    const refreshFn = vi.fn().mockResolvedValue(undefined);
    const scheme = createMockScheme({ refresh: refreshFn });
    const manager = new RefreshManager([scheme]);

    await manager.refresh();
    await manager.refresh();

    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it("resets inflight promise after failure", async () => {
    let callCount = 0;
    const refreshFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error("first failure"));
      }
      return Promise.resolve();
    });

    const scheme = createMockScheme({ refresh: refreshFn });
    const manager = new RefreshManager([scheme]);

    await expect(manager.refresh()).rejects.toThrow("All refresh attempts failed");

    // Second call should work (inflight was cleared)
    await manager.refresh();
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it("tries next scheme when first refresh fails", async () => {
    const failRefresh = vi.fn().mockRejectedValue(new Error("scheme1 failed"));
    const successRefresh = vi.fn().mockResolvedValue(undefined);

    const scheme1 = createMockScheme({ refresh: failRefresh });
    const scheme2 = createMockScheme({ refresh: successRefresh });
    const manager = new RefreshManager([scheme1, scheme2]);

    await manager.refresh();

    expect(failRefresh).toHaveBeenCalledOnce();
    expect(successRefresh).toHaveBeenCalledOnce();
  });

  it("throws with cause when all schemes fail", async () => {
    const error1 = new Error("scheme1 failed");
    const scheme1 = createMockScheme({
      refresh: vi.fn().mockRejectedValue(error1),
    });
    const scheme2 = createMockScheme({
      refresh: vi.fn().mockRejectedValue(new Error("scheme2 failed")),
    });

    const manager = new RefreshManager([scheme1, scheme2]);

    try {
      await manager.refresh();
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      expect((error as AuthError).code).toBe("REFRESH_FAILED");
      expect((error as AuthError).cause).toBe(error1);
    }
  });

  it("skips schemes without refresh method", async () => {
    const schemeNoRefresh = createMockScheme();
    const refreshFn = vi.fn().mockResolvedValue(undefined);
    const schemeWithRefresh = createMockScheme({ refresh: refreshFn });

    const manager = new RefreshManager([schemeNoRefresh, schemeWithRefresh]);
    await manager.refresh();

    expect(refreshFn).toHaveBeenCalledOnce();
  });
});
