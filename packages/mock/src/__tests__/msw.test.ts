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

// Import after mocks are set up
const { setupMockWorker } = await import("../msw.js");

beforeEach(() => {
  vi.clearAllMocks();
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
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-a");
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
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-default");
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

    expect(mockSetupWorker).toHaveBeenCalledWith("h1", "h2", "h3");
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
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-ns");
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
});
