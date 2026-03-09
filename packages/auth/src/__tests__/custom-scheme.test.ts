import { describe, it, expect, vi } from "vitest";
import { customScheme } from "../schemes/custom-scheme.js";

describe("customScheme", () => {
  it("creates a scheme with the given name", () => {
    const scheme = customScheme({
      name: "jwe",
      getHeaders: async () => ({}),
      isAuthenticated: () => false,
      clear: () => {},
    });

    expect(scheme.name).toBe("jwe");
  });

  describe("getHeaders", () => {
    it("delegates to the provided getHeaders function", async () => {
      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({
          Authorization: "Bearer decrypted-jwe",
          "X-Custom": "value",
        }),
        isAuthenticated: () => true,
        clear: () => {},
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({
        Authorization: "Bearer decrypted-jwe",
        "X-Custom": "value",
      });
    });

    it("returns empty headers when function returns empty object", async () => {
      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({}),
        isAuthenticated: () => false,
        clear: () => {},
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({});
    });
  });

  describe("refresh", () => {
    it("delegates to the provided refresh function", async () => {
      const refreshFn = vi.fn().mockResolvedValue(undefined);

      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({}),
        refresh: refreshFn,
        isAuthenticated: () => true,
        clear: () => {},
      });

      await scheme.refresh!();
      expect(refreshFn).toHaveBeenCalledOnce();
    });

    it("is undefined when no refresh function is provided", () => {
      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({}),
        isAuthenticated: () => false,
        clear: () => {},
      });

      expect(scheme.refresh).toBeUndefined();
    });
  });

  describe("isAuthenticated", () => {
    it("delegates to the provided isAuthenticated function", () => {
      let authenticated = false;

      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({}),
        isAuthenticated: () => authenticated,
        clear: () => {},
      });

      expect(scheme.isAuthenticated()).toBe(false);

      authenticated = true;
      expect(scheme.isAuthenticated()).toBe(true);
    });
  });

  describe("clear", () => {
    it("delegates to the provided clear function", () => {
      const clearFn = vi.fn();

      const scheme = customScheme({
        name: "custom",
        getHeaders: async () => ({}),
        isAuthenticated: () => true,
        clear: clearFn,
      });

      scheme.clear();
      expect(clearFn).toHaveBeenCalledOnce();
    });
  });

  it("passes through all callback options to the scheme", () => {
    const getHeaders = vi.fn().mockResolvedValue({});
    const refresh = vi.fn().mockResolvedValue(undefined);
    const isAuthenticated = vi.fn().mockReturnValue(true);
    const clear = vi.fn();

    const scheme = customScheme({
      name: "hmac",
      getHeaders,
      refresh,
      isAuthenticated,
      clear,
    });

    expect(scheme.name).toBe("hmac");
    expect(scheme.getHeaders).toBe(getHeaders);
    expect(scheme.refresh).toBe(refresh);
    expect(scheme.isAuthenticated).toBe(isAuthenticated);
    expect(scheme.clear).toBe(clear);
  });
});
