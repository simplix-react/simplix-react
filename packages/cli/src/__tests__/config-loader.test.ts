import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig } from "../config/config-loader.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("loadConfig", () => {
  it("returns default config when no config file exists", async () => {
    const config = await loadConfig(tempDir);

    expect(config).toEqual({
      api: { baseUrl: "/api" },
      http: {
        environments: {
          development: { baseUrl: "http://localhost:3000" },
        },
      },
      mock: {
        defaultLimit: 50,
        maxLimit: 100,
        dataDir: "idb://simplix-mock",
      },
    });
  });

  it("falls back to defaults when config file cannot be loaded", async () => {
    // Write an invalid config file that will cause jiti to fail
    await writeFile(
      join(tempDir, "simplix.config.ts"),
      "import { nonExistentModule } from 'this-package-does-not-exist';\nexport default {};",
    );

    const config = await loadConfig(tempDir);

    expect(config).toEqual({
      api: { baseUrl: "/api" },
      http: {
        environments: {
          development: { baseUrl: "http://localhost:3000" },
        },
      },
      mock: {
        defaultLimit: 50,
        maxLimit: 100,
        dataDir: "idb://simplix-mock",
      },
    });
  });

  it("loads and merges config from simplix.config.ts when present", async () => {
    await writeFile(
      join(tempDir, "simplix.config.ts"),
      "export default { api: { baseUrl: '/api/v2' } };",
    );

    const config = await loadConfig(tempDir);

    expect(config.api).toEqual({ baseUrl: "/api/v2" });
    // Default fields should still be present via spread
    expect(config.mock).toEqual({
      defaultLimit: 50,
      maxLimit: 100,
      dataDir: "idb://simplix-mock",
    });
  });
});
