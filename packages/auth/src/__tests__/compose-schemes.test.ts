import { describe, it, expect, vi } from "vitest";
import { composeSchemes } from "../schemes/compose-schemes.js";
import type { AuthScheme } from "../types.js";

function createMockScheme(
  name: string,
  overrides: Partial<AuthScheme> = {},
): AuthScheme {
  return {
    name,
    getHeaders: vi.fn().mockResolvedValue({}),
    isAuthenticated: vi.fn().mockReturnValue(false),
    clear: vi.fn(),
    ...overrides,
  };
}

describe("composeSchemes", () => {
  describe("name", () => {
    it("joins scheme names with '+'", () => {
      const scheme1 = createMockScheme("bearer");
      const scheme2 = createMockScheme("api-key");
      const composed = composeSchemes(scheme1, scheme2);
      expect(composed.name).toBe("bearer+api-key");
    });

    it("uses single name for one scheme", () => {
      const scheme = createMockScheme("bearer");
      const composed = composeSchemes(scheme);
      expect(composed.name).toBe("bearer");
    });
  });

  describe("getHeaders", () => {
    it("merges headers from all schemes", async () => {
      const scheme1 = createMockScheme("bearer", {
        getHeaders: vi.fn().mockResolvedValue({ Authorization: "Bearer tok" }),
      });
      const scheme2 = createMockScheme("api-key", {
        getHeaders: vi.fn().mockResolvedValue({ "X-API-Key": "key123" }),
      });

      const composed = composeSchemes(scheme1, scheme2);
      const headers = await composed.getHeaders();

      expect(headers).toEqual({
        Authorization: "Bearer tok",
        "X-API-Key": "key123",
      });
    });

    it("later schemes override conflicting headers", async () => {
      const scheme1 = createMockScheme("first", {
        getHeaders: vi.fn().mockResolvedValue({ Authorization: "first" }),
      });
      const scheme2 = createMockScheme("second", {
        getHeaders: vi.fn().mockResolvedValue({ Authorization: "second" }),
      });

      const composed = composeSchemes(scheme1, scheme2);
      const headers = await composed.getHeaders();

      expect(headers.Authorization).toBe("second");
    });

    it("returns empty headers when all schemes return empty", async () => {
      const scheme1 = createMockScheme("a");
      const scheme2 = createMockScheme("b");

      const composed = composeSchemes(scheme1, scheme2);
      const headers = await composed.getHeaders();

      expect(headers).toEqual({});
    });
  });

  describe("refresh", () => {
    it("calls refresh on the first scheme that supports it", async () => {
      const refreshFn = vi.fn().mockResolvedValue(undefined);
      const scheme1 = createMockScheme("no-refresh");
      const scheme2 = createMockScheme("has-refresh", {
        refresh: refreshFn,
      });
      const scheme3 = createMockScheme("also-refresh", {
        refresh: vi.fn(),
      });

      const composed = composeSchemes(scheme1, scheme2, scheme3);
      await composed.refresh!();

      expect(refreshFn).toHaveBeenCalledOnce();
      expect(scheme3.refresh).not.toHaveBeenCalled();
    });

    it("does nothing when no schemes support refresh", async () => {
      const scheme1 = createMockScheme("a");
      const scheme2 = createMockScheme("b");

      const composed = composeSchemes(scheme1, scheme2);
      await expect(composed.refresh!()).resolves.toBeUndefined();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true if any scheme is authenticated", () => {
      const scheme1 = createMockScheme("a", {
        isAuthenticated: vi.fn().mockReturnValue(false),
      });
      const scheme2 = createMockScheme("b", {
        isAuthenticated: vi.fn().mockReturnValue(true),
      });

      const composed = composeSchemes(scheme1, scheme2);
      expect(composed.isAuthenticated()).toBe(true);
    });

    it("returns false when no scheme is authenticated", () => {
      const scheme1 = createMockScheme("a", {
        isAuthenticated: vi.fn().mockReturnValue(false),
      });
      const scheme2 = createMockScheme("b", {
        isAuthenticated: vi.fn().mockReturnValue(false),
      });

      const composed = composeSchemes(scheme1, scheme2);
      expect(composed.isAuthenticated()).toBe(false);
    });
  });

  describe("clear", () => {
    it("clears all schemes", () => {
      const scheme1 = createMockScheme("a");
      const scheme2 = createMockScheme("b");

      const composed = composeSchemes(scheme1, scheme2);
      composed.clear();

      expect(scheme1.clear).toHaveBeenCalledOnce();
      expect(scheme2.clear).toHaveBeenCalledOnce();
    });
  });
});
