import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { oauth2Scheme } from "../schemes/oauth2-scheme.js";
import { memoryStore } from "../stores/memory-store.js";
import { AuthError } from "../errors.js";
import type { TokenStore } from "../types.js";

describe("oauth2Scheme", () => {
  let store: TokenStore;
  const mockFetch = vi.fn();

  beforeEach(() => {
    store = memoryStore();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getHeaders", () => {
    it("returns Bearer token from store", async () => {
      store.set("access_token", "oauth-token");
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client-id",
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ Authorization: "Bearer oauth-token" });
    });

    it("returns empty headers when no token in store", async () => {
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client-id",
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({});
    });
  });

  describe("refresh", () => {
    it("sends refresh_token grant and stores response", async () => {
      store.set("refresh_token", "my-refresh-token");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "new-access",
            refresh_token: "new-refresh",
            expires_in: 3600,
          }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "my-client",
      });

      await scheme.refresh!();

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("https://auth.example.com/token");
      expect(options.method).toBe("POST");

      const body = options.body as URLSearchParams;
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe("my-refresh-token");
      expect(body.get("client_id")).toBe("my-client");

      expect(store.get("access_token")).toBe("new-access");
      expect(store.get("refresh_token")).toBe("new-refresh");
      expect(store.get("expires_at")).toBeDefined();
    });

    it("sends client_secret when provided", async () => {
      store.set("refresh_token", "rt");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: "at", expires_in: 3600 }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
        clientSecret: "secret",
      });

      await scheme.refresh!();

      const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
      expect(body.get("client_secret")).toBe("secret");
    });

    it("sends scopes when provided", async () => {
      store.set("refresh_token", "rt");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: "at" }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
        scopes: ["read", "write"],
      });

      await scheme.refresh!();

      const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
      expect(body.get("scope")).toBe("read write");
    });

    it("sends custom headers to token endpoint", async () => {
      store.set("refresh_token", "rt");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: "at" }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
        tokenEndpointHeaders: { "X-Custom": "header-value" },
      });

      await scheme.refresh!();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["X-Custom"]).toBe("header-value");
      expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    });

    it("sends custom body parameters", async () => {
      store.set("refresh_token", "rt");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: "at" }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
        tokenEndpointBody: { audience: "https://api.example.com" },
      });

      await scheme.refresh!();

      const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
      expect(body.get("audience")).toBe("https://api.example.com");
    });

    it("keeps existing refresh token if response does not include one", async () => {
      store.set("refresh_token", "original-rt");

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: "new-at" }),
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });

      await scheme.refresh!();

      expect(store.get("access_token")).toBe("new-at");
      expect(store.get("refresh_token")).toBe("original-rt");
    });

    it("throws AuthError when no refresh token is available", async () => {
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });

      await expect(scheme.refresh!()).rejects.toThrow(AuthError);
      await expect(scheme.refresh!()).rejects.toMatchObject({
        code: "REFRESH_FAILED",
      });
    });

    it("throws AuthError when token endpoint returns non-OK status", async () => {
      store.set("refresh_token", "rt");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });

      await expect(scheme.refresh!()).rejects.toThrow(AuthError);
      await expect(scheme.refresh!()).rejects.toMatchObject({
        code: "REFRESH_FAILED",
      });
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when access_token exists in store", () => {
      store.set("access_token", "token");
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });
      expect(scheme.isAuthenticated()).toBe(true);
    });

    it("returns false when no access_token in store", () => {
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });
      expect(scheme.isAuthenticated()).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all token-related keys from store", () => {
      store.set("access_token", "at");
      store.set("refresh_token", "rt");
      store.set("expires_at", "12345");

      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });

      scheme.clear();
      expect(store.get("access_token")).toBeNull();
      expect(store.get("refresh_token")).toBeNull();
      expect(store.get("expires_at")).toBeNull();
    });
  });

  describe("name", () => {
    it("has the name 'oauth2'", () => {
      const scheme = oauth2Scheme({
        store,
        tokenEndpoint: "https://auth.example.com/token",
        clientId: "client",
      });
      expect(scheme.name).toBe("oauth2");
    });
  });
});
