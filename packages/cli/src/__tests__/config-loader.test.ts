import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ConfigLoadError } from "../config/config-load-error.js";
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

  describe("a config file that exists but cannot be loaded", () => {
    const configPath = () => join(tempDir, "simplix.config.ts");

    async function loadFailure(source: string): Promise<ConfigLoadError> {
      await writeFile(configPath(), source);
      const failure: unknown = await loadConfig(tempDir).then(
        () => undefined,
        (err: unknown) => err,
      );
      expect(failure).toBeInstanceOf(ConfigLoadError);
      return failure as ConfigLoadError;
    }

    it("rejects when an import does not resolve, naming the file and the missing module", async () => {
      const failure = await loadFailure("import { baseUrl } from 'this-package-does-not-exist';\nexport default { api: { baseUrl } };");
      expect(failure.path).toBe(configPath());
      expect(failure.message).toContain(configPath());
      expect(failure.message).toContain("this-package-does-not-exist");
    });

    it("rejects when the file does not parse", async () => {
      const failure = await loadFailure("export default { api: { baseUrl: '/api' ;\n");
      expect(failure.message).toContain(configPath());
      expect(failure.cause).toBeInstanceOf(Error);
    });

    it("rejects when an expression throws while the file evaluates, keeping the original error", async () => {
      const failure = await loadFailure("throw new Error('boom from the config');\nexport default {};");
      expect(failure.message).toContain(configPath());
      expect(failure.message).toContain("boom from the config");
      expect(failure.cause).toBeInstanceOf(Error);
      expect((failure.cause as Error).message).toContain("boom from the config");
    });

    it("rejects when the file refers to a name that is not defined", async () => {
      const failure = await loadFailure("export default { templates: { storiesDir: board/screens } };");
      expect(failure.message).toContain(configPath());
      expect(failure.message).toContain("board");
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
