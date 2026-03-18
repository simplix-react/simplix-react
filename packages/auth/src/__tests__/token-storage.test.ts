import { describe, it, expect } from "vitest";
import {
  storeTokenPair,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXPIRES_AT_KEY,
  REFRESH_EXPIRES_AT_KEY,
} from "../helpers/token-storage.js";
import { memoryStore } from "../stores/memory-store.js";

describe("storeTokenPair", () => {
  it("stores access token", () => {
    const store = memoryStore();
    storeTokenPair(store, { accessToken: "abc" });
    expect(store.get(ACCESS_TOKEN_KEY)).toBe("abc");
  });

  it("stores refresh token when provided", () => {
    const store = memoryStore();
    storeTokenPair(store, { accessToken: "abc", refreshToken: "rt" });
    expect(store.get(REFRESH_TOKEN_KEY)).toBe("rt");
  });

  it("does not store refresh token when absent", () => {
    const store = memoryStore();
    storeTokenPair(store, { accessToken: "abc" });
    expect(store.get(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("stores expiresAt as epoch ms when given a number", () => {
    const store = memoryStore();
    const expiresAt = Date.now() + 60_000;
    storeTokenPair(store, { accessToken: "abc", expiresAt });
    expect(store.get(EXPIRES_AT_KEY)).toBe(String(expiresAt));
  });

  it("stores expiresAt as epoch ms when given an ISO string", () => {
    const store = memoryStore();
    const isoDate = "2025-06-15T12:00:00Z";
    const expectedMs = new Date(isoDate).getTime();

    storeTokenPair(store, { accessToken: "abc", expiresAt: isoDate });
    expect(store.get(EXPIRES_AT_KEY)).toBe(String(expectedMs));
  });

  it("computes expiresAt from expiresIn when expiresAt is absent", () => {
    const store = memoryStore();
    const before = Date.now();

    storeTokenPair(store, { accessToken: "abc", expiresIn: 3600 });

    const stored = Number(store.get(EXPIRES_AT_KEY));
    const after = Date.now();

    // expiresAt should be approximately now + 3600*1000
    expect(stored).toBeGreaterThanOrEqual(before + 3600 * 1000);
    expect(stored).toBeLessThanOrEqual(after + 3600 * 1000);
  });

  it("prefers expiresAt over expiresIn when both are provided", () => {
    const store = memoryStore();
    const expiresAt = 9999999999999;

    storeTokenPair(store, {
      accessToken: "abc",
      expiresAt,
      expiresIn: 3600,
    });

    expect(store.get(EXPIRES_AT_KEY)).toBe(String(expiresAt));
  });

  it("does not store expires_at when neither expiresAt nor expiresIn provided", () => {
    const store = memoryStore();
    storeTokenPair(store, { accessToken: "abc" });
    expect(store.get(EXPIRES_AT_KEY)).toBeNull();
  });

  it("stores refreshTokenExpiresAt as epoch ms when given a number", () => {
    const store = memoryStore();
    const refreshExpiresAt = Date.now() + 86_400_000;

    storeTokenPair(store, {
      accessToken: "abc",
      refreshTokenExpiresAt: refreshExpiresAt,
    });

    expect(store.get(REFRESH_EXPIRES_AT_KEY)).toBe(String(refreshExpiresAt));
  });

  it("stores refreshTokenExpiresAt as epoch ms when given an ISO string", () => {
    const store = memoryStore();
    const isoDate = "2025-12-31T23:59:59Z";
    const expectedMs = new Date(isoDate).getTime();

    storeTokenPair(store, {
      accessToken: "abc",
      refreshTokenExpiresAt: isoDate,
    });

    expect(store.get(REFRESH_EXPIRES_AT_KEY)).toBe(String(expectedMs));
  });

  it("does not store refresh_expires_at when not provided", () => {
    const store = memoryStore();
    storeTokenPair(store, { accessToken: "abc" });
    expect(store.get(REFRESH_EXPIRES_AT_KEY)).toBeNull();
  });

  it("stores all fields when full token pair is provided", () => {
    const store = memoryStore();
    const now = Date.now();

    storeTokenPair(store, {
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: now + 3600_000,
      refreshTokenExpiresAt: now + 86_400_000,
    });

    expect(store.get(ACCESS_TOKEN_KEY)).toBe("access");
    expect(store.get(REFRESH_TOKEN_KEY)).toBe("refresh");
    expect(store.get(EXPIRES_AT_KEY)).toBe(String(now + 3600_000));
    expect(store.get(REFRESH_EXPIRES_AT_KEY)).toBe(String(now + 86_400_000));
  });
});
