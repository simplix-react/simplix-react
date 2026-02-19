import type { FetchFn } from "@simplix-react/contract";
import { describe, expect, it, vi } from "vitest";

import { createSpringAuthConfig } from "../spring-auth-config.js";

function createMockFetch(response: unknown): FetchFn {
  return vi.fn().mockResolvedValue(response) as FetchFn;
}

describe("createSpringAuthConfig", () => {
  describe("loginFn", () => {
    it("sends Basic Auth header to login endpoint", async () => {
      const tokenResponse = {
        accessToken: "access-123",
        refreshToken: "refresh-456",
        accessTokenExpiry: "2026-02-20T01:00:00Z",
        refreshTokenExpiry: "2026-02-27T00:00:00Z",
      };
      const mockFetch = createMockFetch(tokenResponse);
      const { loginFn } = createSpringAuthConfig({ fetchFn: mockFetch });

      const result = await loginFn("admin", "password123");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/auth/token/issue",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa("admin:password123")}`,
          },
        },
      );
      expect(result).toEqual({
        accessToken: "access-123",
        refreshToken: "refresh-456",
        expiresAt: "2026-02-20T01:00:00Z",
        refreshTokenExpiresAt: "2026-02-27T00:00:00Z",
      });
    });

    it("uses custom login endpoint", async () => {
      const mockFetch = createMockFetch({
        accessToken: "t",
        refreshToken: "r",
        accessTokenExpiry: "2026-01-01T00:00:00Z",
        refreshTokenExpiry: "2026-01-01T00:00:00Z",
      });
      const { loginFn } = createSpringAuthConfig({
        loginEndpoint: "/custom/login",
        fetchFn: mockFetch,
      });

      await loginFn("user", "pass");

      expect(mockFetch).toHaveBeenCalledWith(
        "/custom/login",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("refreshFn", () => {
    it("posts to refresh endpoint", async () => {
      const tokenResponse = {
        accessToken: "new-access",
        refreshToken: "new-refresh",
        accessTokenExpiry: "2026-02-20T02:00:00Z",
        refreshTokenExpiry: "2026-02-27T00:00:00Z",
      };
      const mockFetch = createMockFetch(tokenResponse);
      const { refreshFn } = createSpringAuthConfig({ fetchFn: mockFetch });

      const result = await refreshFn();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/auth/token/refresh",
        { method: "POST" },
      );
      expect(result.accessToken).toBe("new-access");
    });

    it("uses custom refresh endpoint", async () => {
      const mockFetch = createMockFetch({
        accessToken: "t",
        refreshToken: "r",
        accessTokenExpiry: "2026-01-01T00:00:00Z",
        refreshTokenExpiry: "2026-01-01T00:00:00Z",
      });
      const { refreshFn } = createSpringAuthConfig({
        refreshEndpoint: "/custom/refresh",
        fetchFn: mockFetch,
      });

      await refreshFn();

      expect(mockFetch).toHaveBeenCalledWith(
        "/custom/refresh",
        { method: "POST" },
      );
    });
  });

  describe("revokeFn", () => {
    it("posts to revoke endpoint", async () => {
      const mockFetch = createMockFetch(undefined);
      const { revokeFn } = createSpringAuthConfig({ fetchFn: mockFetch });

      await revokeFn();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/auth/token/revoke",
        { method: "POST" },
      );
    });

    it("uses custom revoke endpoint", async () => {
      const mockFetch = createMockFetch(undefined);
      const { revokeFn } = createSpringAuthConfig({
        revokeEndpoint: "/custom/revoke",
        fetchFn: mockFetch,
      });

      await revokeFn();

      expect(mockFetch).toHaveBeenCalledWith(
        "/custom/revoke",
        { method: "POST" },
      );
    });
  });

  describe("userInfoFn", () => {
    it("sends Bearer token to user info endpoint", async () => {
      const user = {
        userId: "user-1",
        username: "john",
        displayName: "John Doe",
        roles: ["ROLE_USER"],
      };
      const mockFetch = createMockFetch(user);
      const { userInfoFn } = createSpringAuthConfig({ fetchFn: mockFetch });

      const result = await userInfoFn("my-access-token");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/user/me",
        {
          headers: {
            Authorization: "Bearer my-access-token",
          },
        },
      );
      expect(result).toEqual(user);
    });

    it("uses custom user info endpoint", async () => {
      const mockFetch = createMockFetch({
        userId: "1",
        username: "test",
        roles: [],
      });
      const { userInfoFn } = createSpringAuthConfig({
        userInfoEndpoint: "/custom/me",
        fetchFn: mockFetch,
      });

      await userInfoFn("token");

      expect(mockFetch).toHaveBeenCalledWith(
        "/custom/me",
        expect.objectContaining({
          headers: { Authorization: "Bearer token" },
        }),
      );
    });
  });
});
