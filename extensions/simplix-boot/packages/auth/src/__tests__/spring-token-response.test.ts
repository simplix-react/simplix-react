import { describe, expect, it } from "vitest";

import { parseSpringTokenResponse } from "../spring-token-response.js";

describe("parseSpringTokenResponse", () => {
  it("maps Spring token response to TokenPair", () => {
    const result = parseSpringTokenResponse({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      accessTokenExpiry: "2026-02-20T01:00:00Z",
      refreshTokenExpiry: "2026-02-27T00:00:00Z",
    });

    expect(result).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      expiresAt: "2026-02-20T01:00:00Z",
      refreshTokenExpiresAt: "2026-02-27T00:00:00Z",
    });
  });

  it("preserves ISO 8601 format for expiry fields", () => {
    const expiry = "2026-12-31T23:59:59.999Z";
    const refreshExpiry = "2027-01-31T23:59:59.999Z";

    const result = parseSpringTokenResponse({
      accessToken: "token",
      refreshToken: "refresh",
      accessTokenExpiry: expiry,
      refreshTokenExpiry: refreshExpiry,
    });

    expect(result.expiresAt).toBe(expiry);
    expect(result.refreshTokenExpiresAt).toBe(refreshExpiry);
  });
});
