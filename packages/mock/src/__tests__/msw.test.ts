import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockDomainConfig } from "../msw.js";

// Mock mock-store
const mockResetStore = vi.fn();
const mockSeedEntityStore = vi.fn();
vi.mock("../mock-store.js", () => ({
  resetStore: (...args: unknown[]) => mockResetStore(...args),
  seedEntityStore: (...args: unknown[]) => mockSeedEntityStore(...args),
}));

// Mock MSW browser (dynamic import)
const mockStart = vi.fn().mockResolvedValue(undefined);
const mockSetupWorker = vi.fn().mockReturnValue({ start: mockStart });
vi.mock("msw/browser", () => ({
  setupWorker: mockSetupWorker,
}));

// Capture the callback passed to http.all for passthrough handler testing
let capturedPassthroughCallback: ((info: { request: Request }) => unknown) | undefined;
const mockPassthrough = vi.fn().mockReturnValue("passthrough-sentinel");
const mockHttpAll = vi.fn().mockImplementation((_pattern: string, callback: (info: { request: Request }) => unknown) => {
  capturedPassthroughCallback = callback;
  return "http-all-handler";
});

vi.mock("msw", () => ({
  http: { all: (...args: unknown[]) => mockHttpAll(...args) },
  passthrough: (...args: unknown[]) => mockPassthrough(...args),
}));

// Import after mocks are set up
const { setupMockWorker } = await import("../msw.js");

beforeEach(() => {
  vi.clearAllMocks();
  capturedPassthroughCallback = undefined;
});

describe("setupMockWorker", () => {
  it("runs only enabled domains (skips enabled:false)", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "active",
        enabled: true,
        handlers: ["handler-a"],
        seed: { store_a: [{ id: 1, name: "A" }] },
      },
      {
        name: "inactive",
        enabled: false,
        handlers: ["handler-b"],
        seed: { store_b: [{ id: 2, name: "B" }] },
      },
    ];

    await setupMockWorker({ domains });

    expect(mockSeedEntityStore).toHaveBeenCalledWith("store_a", [{ id: 1, name: "A" }]);
    expect(mockSeedEntityStore).not.toHaveBeenCalledWith("store_b", expect.anything());
    // setupWorker receives domain handlers + a catch-all passthrough handler
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-a", "http-all-handler");
  });

  it("treats domains without explicit enabled field as enabled", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "default-enabled",
        handlers: ["handler-default"],
        seed: { store_x: [{ id: 1 }] },
      },
    ];

    await setupMockWorker({ domains });

    expect(mockSeedEntityStore).toHaveBeenCalledWith("store_x", [{ id: 1 }]);
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-default", "http-all-handler");
  });

  it("calls resetStore before seeding", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "domain-a",
        handlers: [],
        seed: { store_a: [{ id: 1 }] },
      },
    ];

    await setupMockWorker({ domains });

    expect(mockResetStore).toHaveBeenCalledTimes(1);
    // resetStore should be called before seedEntityStore
    const resetOrder = mockResetStore.mock.invocationCallOrder[0];
    const seedOrder = mockSeedEntityStore.mock.invocationCallOrder[0];
    expect(resetOrder).toBeLessThan(seedOrder);
  });

  it("merges handlers from all enabled domains via flatMap", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "domain-a",
        handlers: ["h1", "h2"],
      },
      {
        name: "domain-b",
        handlers: ["h3"],
      },
      {
        name: "domain-c",
        enabled: false,
        handlers: ["h4"],
      },
    ];

    await setupMockWorker({ domains });

    // setupWorker receives domain handlers + a catch-all passthrough handler
    expect(mockSetupWorker).toHaveBeenCalledWith("h1", "h2", "h3", "http-all-handler");
  });

  it("handles empty domains array without error", async () => {
    await setupMockWorker({ domains: [] });

    expect(mockResetStore).not.toHaveBeenCalled();
    expect(mockSetupWorker).not.toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it("works correctly when seed is omitted", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "no-seed",
        handlers: ["handler-ns"],
      },
    ];

    await setupMockWorker({ domains });

    expect(mockSeedEntityStore).not.toHaveBeenCalled();
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-ns", "http-all-handler");
    expect(mockStart).toHaveBeenCalled();
  });

  it("starts worker with correct options", async () => {
    const domains: MockDomainConfig[] = [
      { name: "test", handlers: [] },
    ];

    await setupMockWorker({ domains });

    expect(mockStart).toHaveBeenCalledWith({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
  });

  // ── Cross-origin passthrough handler ──

  describe("cross-origin passthrough handler", () => {
    it("returns passthrough for cross-origin requests", async () => {
      // Set up globalThis.location for the test
      const originalLocation = globalThis.location;
      Object.defineProperty(globalThis, "location", {
        value: { origin: "http://localhost:5173" },
        writable: true,
        configurable: true,
      });

      await setupMockWorker({ domains: [{ name: "test", handlers: [] }] });

      expect(capturedPassthroughCallback).toBeDefined();

      // Cross-origin request (different origin)
      const crossOriginReq = new Request("https://cdn.example.com/tiles/map.png");
      const result = capturedPassthroughCallback!({ request: crossOriginReq });

      expect(mockPassthrough).toHaveBeenCalledTimes(1);
      expect(result).toBe("passthrough-sentinel");

      // Restore location
      if (originalLocation) {
        Object.defineProperty(globalThis, "location", {
          value: originalLocation,
          writable: true,
          configurable: true,
        });
      }
    });

    it("returns undefined for same-origin requests", async () => {
      const originalLocation = globalThis.location;
      Object.defineProperty(globalThis, "location", {
        value: { origin: "http://localhost:5173" },
        writable: true,
        configurable: true,
      });

      await setupMockWorker({ domains: [{ name: "test", handlers: [] }] });

      expect(capturedPassthroughCallback).toBeDefined();

      // Same-origin request
      const sameOriginReq = new Request("http://localhost:5173/api/v1/tasks");
      const result = capturedPassthroughCallback!({ request: sameOriginReq });

      // Should NOT call passthrough for same-origin
      expect(mockPassthrough).not.toHaveBeenCalled();
      expect(result).toBeUndefined();

      // Restore location
      if (originalLocation) {
        Object.defineProperty(globalThis, "location", {
          value: originalLocation,
          writable: true,
          configurable: true,
        });
      }
    });

    it("registers http.all with wildcard pattern", async () => {
      await setupMockWorker({ domains: [{ name: "test", handlers: [] }] });

      expect(mockHttpAll).toHaveBeenCalledWith("*", expect.any(Function));
    });
  });
});
