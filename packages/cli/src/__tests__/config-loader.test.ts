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
      i18n: { locales: ["en", "ko", "ja"], defaultLocale: "en" },
      http: {
        environments: {
          development: { baseUrl: "http://localhost:3000" },
        },
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
      i18n: { locales: ["en", "ko", "ja"], defaultLocale: "en" },
      http: {
        environments: {
          development: { baseUrl: "http://localhost:3000" },
        },
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
  });
});
