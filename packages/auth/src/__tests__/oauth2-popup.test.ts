// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openOAuth2Popup } from "../helpers/oauth2-popup.js";

describe("openOAuth2Popup", () => {
  let originalOpen: typeof window.open;

  beforeEach(() => {
    originalOpen = window.open;
    vi.useFakeTimers();
  });

  afterEach(() => {
    window.open = originalOpen;
    vi.useRealTimers();
  });

  it("resolves with error when popup is blocked", async () => {
    window.open = vi.fn().mockReturnValue(null);

    const result = await openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
    });

    expect(result).toEqual({
      type: "error",
      message: "Popup blocked by browser",
    });
  });

  it("resolves with success when valid postMessage is received", async () => {
    const mockWin = { closed: false, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
    });

    // Simulate the callback posting a message
    const event = new MessageEvent("message", {
      data: { code: "auth-code-123" },
      origin: "https://example.com",
    });
    window.dispatchEvent(event);

    const result = await promise;

    expect(result).toEqual({
      type: "success",
      data: { code: "auth-code-123" },
    });
    expect(mockWin.close).toHaveBeenCalled();
  });

  it("ignores messages from wrong origin", async () => {
    const mockWin = { closed: false, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
      timeoutMs: 500,
    });

    // Dispatch message from wrong origin
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { code: "evil" },
        origin: "https://evil.com",
      }),
    );

    // Advance past the timeout
    vi.advanceTimersByTime(600);

    const result = await promise;
    expect(result.type).toBe("timeout");
  });

  it("resolves with cancelled when user closes popup", async () => {
    const mockWin = { closed: false, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
    });

    // Simulate user closing the popup
    mockWin.closed = true;

    // Advance past the poll interval (500ms)
    vi.advanceTimersByTime(600);

    const result = await promise;
    expect(result).toEqual({ type: "cancelled" });
  });

  it("resolves with timeout when timeoutMs elapses", async () => {
    const mockWin = { closed: false, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
      timeoutMs: 5000,
    });

    vi.advanceTimersByTime(5100);

    const result = await promise;
    expect(result).toEqual({ type: "timeout" });
    expect(mockWin.close).toHaveBeenCalled();
  });

  it("does not close popup on timeout if already closed", async () => {
    const mockWin = { closed: true, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
      timeoutMs: 1000,
    });

    // Poll fires first (500ms) — popup already closed, resolves as cancelled
    vi.advanceTimersByTime(600);

    const result = await promise;
    // Cancelled fires first because poll interval (500ms) < timeout (1000ms)
    expect(result.type).toBe("cancelled");
  });

  it("uses custom width, height dimensions", async () => {
    const openSpy = vi.fn().mockReturnValue(null);
    window.open = openSpy;

    await openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
      width: 800,
      height: 700,
    });

    expect(openSpy).toHaveBeenCalledWith(
      "https://auth.example.com/authorize",
      "oauth2_popup",
      expect.stringContaining("width=800"),
    );
    expect(openSpy).toHaveBeenCalledWith(
      "https://auth.example.com/authorize",
      "oauth2_popup",
      expect.stringContaining("height=700"),
    );
  });

  it("does not close popup on success if already closed", async () => {
    const mockWin = { closed: true, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { token: "abc" },
        origin: "https://example.com",
      }),
    );

    const result = await promise;
    expect(result.type).toBe("success");
    expect(mockWin.close).not.toHaveBeenCalled();
  });

  it("ignores postMessage after already resolved", async () => {
    const mockWin = { closed: false, close: vi.fn() };
    window.open = vi.fn().mockReturnValue(mockWin);

    const promise = openOAuth2Popup({
      url: "https://auth.example.com/authorize",
      expectedOrigin: "https://example.com",
    });

    // First message resolves the promise
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { first: true },
        origin: "https://example.com",
      }),
    );

    const result = await promise;
    expect(result).toEqual({ type: "success", data: { first: true } });

    // Second message is ignored (already resolved)
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { second: true },
        origin: "https://example.com",
      }),
    );

    // No error thrown, result unchanged
  });
});
