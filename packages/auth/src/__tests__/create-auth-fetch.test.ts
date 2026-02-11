import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@simplix-react/contract";
import { createAuthFetch } from "../create-auth-fetch.js";
import { memoryStore } from "../stores/memory-store.js";
import { bearerScheme } from "../schemes/bearer-scheme.js";
import { apiKeyScheme } from "../schemes/api-key-scheme.js";
import type { FetchFn } from "@simplix-react/contract";
import type { TokenStore } from "../types.js";

describe("createAuthFetch", () => {
  let store: TokenStore;
  let mockBaseFetch: FetchFn;

  beforeEach(() => {
    store = memoryStore();
    mockBaseFetch = vi.fn();
  });

  describe("header injection", () => {
    it("injects auth headers into requests", async () => {
      store.set("access_token", "my-token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await authFetch("/api/data");

      const call = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe("/api/data");
      expect(call[1].headers).toMatchObject({
        Authorization: "Bearer my-token",
      });
    });

    it("auth headers come before user-provided headers (user headers override)", async () => {
      store.set("access_token", "auth-token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await authFetch("/api/data", {
        headers: { Authorization: "Bearer user-token" },
      });

      const call = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[1].headers.Authorization).toBe("Bearer user-token");
    });
  });

  describe("query param injection", () => {
    it("appends query params from X-Auth-Query-Params header", async () => {
      const authFetch = createAuthFetch(
        {
          schemes: [
            apiKeyScheme({ in: "query", name: "api_key", key: "my-key" }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await authFetch("/api/data");

      const call = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe("/api/data?api_key=my-key");
      // The X-Auth-Query-Params header should be removed
      expect(call[1].headers["X-Auth-Query-Params"]).toBeUndefined();
    });

    it("appends with '&' when path already has query params", async () => {
      const authFetch = createAuthFetch(
        {
          schemes: [
            apiKeyScheme({ in: "query", name: "api_key", key: "my-key" }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await authFetch("/api/data?page=1");

      const call = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe("/api/data?page=1&api_key=my-key");
    });
  });

  describe("401 retry flow", () => {
    it("retries after 401 with refreshed token", async () => {
      store.set("access_token", "old-token");

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
      });

      const scheme = bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn },
      });

      const authFetch = createAuthFetch(
        { schemes: [scheme] },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new ApiError(401, "Unauthorized"))
        .mockResolvedValueOnce({ data: "success" });

      const result = await authFetch("/api/protected");
      expect(result).toEqual({ data: "success" });
      expect(mockBaseFetch).toHaveBeenCalledTimes(2);
      expect(refreshFn).toHaveBeenCalledOnce();
    });

    it("does not retry non-401 errors", async () => {
      store.set("access_token", "token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ApiError(500, "Server Error"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow(ApiError);
      expect(mockBaseFetch).toHaveBeenCalledTimes(1);
    });

    it("does not retry non-ApiError errors", async () => {
      store.set("access_token", "token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new TypeError("network error"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow(TypeError);
      expect(mockBaseFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("maxRetries", () => {
    it("defaults to 1 retry", async () => {
      store.set("access_token", "token");

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
      });

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({
              store,
              token: () => store.get("access_token"),
              refresh: { refreshFn },
            }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ApiError(401, "Unauthorized"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow(ApiError);
      // Initial attempt + 1 retry = 2 calls
      expect(mockBaseFetch).toHaveBeenCalledTimes(2);
    });

    it("respects custom maxRetries", async () => {
      store.set("access_token", "token");

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
      });

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({
              store,
              token: () => store.get("access_token"),
              refresh: { refreshFn },
            }),
          ],
          maxRetries: 3,
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ApiError(401, "Unauthorized"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow(ApiError);
      // Initial attempt + 3 retries = 4 calls
      expect(mockBaseFetch).toHaveBeenCalledTimes(4);
    });

    it("stops retrying once request succeeds", async () => {
      store.set("access_token", "token");

      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: "new-token",
      });

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({
              store,
              token: () => store.get("access_token"),
              refresh: { refreshFn },
            }),
          ],
          maxRetries: 3,
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new ApiError(401, "Unauthorized"))
        .mockResolvedValueOnce("ok");

      const result = await authFetch("/api/data");
      expect(result).toBe("ok");
      expect(mockBaseFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("onRefreshFailure", () => {
    it("calls onRefreshFailure when refresh fails", async () => {
      store.set("access_token", "token");
      const onRefreshFailure = vi.fn();

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
          onRefreshFailure,
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ApiError(401, "Unauthorized"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow();
      expect(onRefreshFailure).toHaveBeenCalledOnce();
      expect(onRefreshFailure.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it("throws refresh error even when onRefreshFailure is provided", async () => {
      store.set("access_token", "token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
          ],
          onRefreshFailure: vi.fn(),
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ApiError(401, "Unauthorized"),
      );

      await expect(authFetch("/api/data")).rejects.toThrow();
    });
  });

  describe("multiple schemes", () => {
    it("merges headers from multiple schemes", async () => {
      store.set("access_token", "bearer-token");

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({ store, token: () => store.get("access_token") }),
            apiKeyScheme({ in: "header", name: "X-API-Key", key: "api-key" }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>).mockResolvedValue("ok");
      await authFetch("/api/data");

      const call = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[1].headers).toMatchObject({
        Authorization: "Bearer bearer-token",
        "X-API-Key": "api-key",
      });
    });
  });

  describe("uses fresh headers on retry", () => {
    it("fetches fresh auth headers after refresh on retry", async () => {
      store.set("access_token", "old-token");

      const refreshFn = vi.fn().mockImplementation(async () => {
        store.set("access_token", "refreshed-token");
        return { accessToken: "refreshed-token" };
      });

      const authFetch = createAuthFetch(
        {
          schemes: [
            bearerScheme({
              store,
              token: () => store.get("access_token"),
              refresh: { refreshFn },
            }),
          ],
        },
        mockBaseFetch,
      );

      (mockBaseFetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new ApiError(401, "Unauthorized"))
        .mockResolvedValueOnce("success");

      await authFetch("/api/data");

      const retryCall = (mockBaseFetch as ReturnType<typeof vi.fn>).mock.calls[1];
      expect(retryCall[1].headers.Authorization).toBe("Bearer refreshed-token");
    });
  });
});
