import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockDomainConfig } from "../msw.js";

// Mock PGlite
const mockDb = {};
vi.mock("../pglite.js", () => ({
  initPGlite: vi.fn().mockResolvedValue(mockDb),
}));

// Mock MSW browser (dynamic import)
const mockStart = vi.fn().mockResolvedValue(undefined);
const mockSetupWorker = vi.fn().mockReturnValue({ start: mockStart });
vi.mock("msw/browser", () => ({
  setupWorker: mockSetupWorker,
}));

// Import after mocks are set up
const { setupMockWorker } = await import("../msw.js");
const { initPGlite } = await import("../pglite.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("setupMockWorker", () => {
  it("runs only enabled domains (skips enabled:false)", async () => {
    const enabledMigration = vi.fn();
    const disabledMigration = vi.fn();
    const enabledSeed = vi.fn();
    const disabledSeed = vi.fn();

    const domains: MockDomainConfig[] = [
      {
        name: "active",
        enabled: true,
        handlers: ["handler-a"],
        migrations: [enabledMigration],
        seed: [enabledSeed],
      },
      {
        name: "inactive",
        enabled: false,
        handlers: ["handler-b"],
        migrations: [disabledMigration],
        seed: [disabledSeed],
      },
    ];

    await setupMockWorker({ domains });

    expect(enabledMigration).toHaveBeenCalledWith(mockDb);
    expect(enabledSeed).toHaveBeenCalledWith(mockDb);
    expect(disabledMigration).not.toHaveBeenCalled();
    expect(disabledSeed).not.toHaveBeenCalled();
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-a");
  });

  it("treats domains without explicit enabled field as enabled", async () => {
    const migration = vi.fn();

    const domains: MockDomainConfig[] = [
      {
        name: "default-enabled",
        handlers: ["handler-default"],
        migrations: [migration],
      },
    ];

    await setupMockWorker({ domains });

    expect(migration).toHaveBeenCalledWith(mockDb);
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-default");
  });

  it("runs all migrations before any seeds", async () => {
    const order: string[] = [];

    const migrationA = vi.fn().mockImplementation(async () => {
      order.push("migration-a");
    });
    const migrationB = vi.fn().mockImplementation(async () => {
      order.push("migration-b");
    });
    const seedA = vi.fn().mockImplementation(async () => {
      order.push("seed-a");
    });
    const seedB = vi.fn().mockImplementation(async () => {
      order.push("seed-b");
    });

    const domains: MockDomainConfig[] = [
      {
        name: "domain-a",
        handlers: [],
        migrations: [migrationA],
        seed: [seedA],
      },
      {
        name: "domain-b",
        handlers: [],
        migrations: [migrationB],
        seed: [seedB],
      },
    ];

    await setupMockWorker({ domains });

    expect(order).toEqual([
      "migration-a",
      "migration-b",
      "seed-a",
      "seed-b",
    ]);
  });

  it("merges handlers from all enabled domains via flatMap", async () => {
    const domains: MockDomainConfig[] = [
      {
        name: "domain-a",
        handlers: ["h1", "h2"],
        migrations: [],
      },
      {
        name: "domain-b",
        handlers: ["h3"],
        migrations: [],
      },
      {
        name: "domain-c",
        enabled: false,
        handlers: ["h4"],
        migrations: [],
      },
    ];

    await setupMockWorker({ domains });

    expect(mockSetupWorker).toHaveBeenCalledWith("h1", "h2", "h3");
  });

  it("handles empty domains array without error", async () => {
    await setupMockWorker({ domains: [] });

    expect(initPGlite).toHaveBeenCalled();
    expect(mockSetupWorker).toHaveBeenCalledWith();
    expect(mockStart).toHaveBeenCalled();
  });

  it("works correctly when seed is omitted", async () => {
    const migration = vi.fn();

    const domains: MockDomainConfig[] = [
      {
        name: "no-seed",
        handlers: ["handler-ns"],
        migrations: [migration],
      },
    ];

    await setupMockWorker({ domains });

    expect(migration).toHaveBeenCalledWith(mockDb);
    expect(mockSetupWorker).toHaveBeenCalledWith("handler-ns");
    expect(mockStart).toHaveBeenCalled();
  });

  it("passes dataDir to initPGlite", async () => {
    await setupMockWorker({
      dataDir: "idb://custom-dir",
      domains: [],
    });

    expect(initPGlite).toHaveBeenCalledWith("idb://custom-dir");
  });

  it("uses default dataDir when not specified", async () => {
    await setupMockWorker({ domains: [] });

    expect(initPGlite).toHaveBeenCalledWith("idb://simplix-mock");
  });

  it("starts worker with correct options", async () => {
    await setupMockWorker({ domains: [] });

    expect(mockStart).toHaveBeenCalledWith({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
  });
});
