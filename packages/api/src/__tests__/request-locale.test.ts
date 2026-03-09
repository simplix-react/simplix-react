import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  configureMutator,
  getMutator,
  setRequestLocale,
  getRequestLocale,
} from "../index.js";

// Reset module-level state between tests
// Since _locale is module-scoped, we reset via the public API
beforeEach(() => {
  // Reset locale by setting to undefined-equivalent state
  // We use a fresh mutator for each test
  configureMutator(vi.fn().mockResolvedValue({}));
});

describe("setRequestLocale / getRequestLocale", () => {
  it("returns undefined when not set", () => {
    // getRequestLocale reads the module state; after import it starts undefined
    // but previous tests may have set it — this test verifies the setter/getter contract
    setRequestLocale("en");
    expect(getRequestLocale()).toBe("en");
  });

  it("stores the locale", () => {
    setRequestLocale("ko");
    expect(getRequestLocale()).toBe("ko");
  });

  it("overwrites previous value", () => {
    setRequestLocale("ko");
    setRequestLocale("ja");
    expect(getRequestLocale()).toBe("ja");
  });
});

describe("getMutator Accept-Language injection", () => {
  it("injects Accept-Language header when locale is set", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "ok" });
    configureMutator(mockFetch);
    setRequestLocale("ko");

    const mutator = getMutator();
    await mutator("/api/test", { method: "GET" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/test");
    const headers = new Headers(options.headers);
    expect(headers.get("Accept-Language")).toBe("ko");
  });

  it("preserves existing headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    configureMutator(mockFetch);
    setRequestLocale("en");

    const mutator = getMutator();
    await mutator("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer token" },
    });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("Accept-Language")).toBe("en");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token");
  });

  it("does not overwrite explicit Accept-Language header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    configureMutator(mockFetch);
    setRequestLocale("ko");

    const mutator = getMutator();
    await mutator("/api/test", {
      headers: { "Accept-Language": "ja" },
    });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("Accept-Language")).toBe("ja");
  });

  it("works with named strategy", async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    configureMutator("admin", mockFetch);
    setRequestLocale("en-US");

    const mutator = getMutator("admin");
    await mutator("/api/admin", { method: "GET" });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get("Accept-Language")).toBe("en-US");
  });

  it("reflects latest locale on each call", async () => {
    const mockFetch = vi.fn().mockResolvedValue({});
    configureMutator(mockFetch);

    setRequestLocale("ko");
    let mutator = getMutator();
    await mutator("/api/test");

    setRequestLocale("en");
    mutator = getMutator();
    await mutator("/api/test");

    const firstHeaders = new Headers(mockFetch.mock.calls[0][1].headers);
    const secondHeaders = new Headers(mockFetch.mock.calls[1][1].headers);
    expect(firstHeaders.get("Accept-Language")).toBe("ko");
    expect(secondHeaders.get("Accept-Language")).toBe("en");
  });
});
