import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { isSpecUrl, loadOpenAPISpec } from "../openapi/pipeline/parser.js";

describe("isSpecUrl", () => {
  it("returns true for http:// URL", () => {
    expect(isSpecUrl("http://example.com/openapi.json")).toBe(true);
  });

  it("returns true for https:// URL", () => {
    expect(isSpecUrl("https://api.example.com/openapi.json")).toBe(true);
  });

  it("returns false for local file path", () => {
    expect(isSpecUrl("openapi/spec.json")).toBe(false);
  });

  it("returns false for absolute file path", () => {
    expect(isSpecUrl("/home/user/openapi.json")).toBe(false);
  });

  it("returns false for relative path with dots", () => {
    expect(isSpecUrl("./openapi.json")).toBe(false);
    expect(isSpecUrl("../spec.json")).toBe(false);
  });
});

describe("loadOpenAPISpec", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "simplix-parser-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("loads and parses a valid JSON spec from file", async () => {
    const specPath = join(tempDir, "openapi.json");
    await writeFile(specPath, JSON.stringify({
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      paths: { "/test": {} },
    }));

    const spec = await loadOpenAPISpec(specPath);
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info.title).toBe("Test");
    expect(spec.paths).toHaveProperty("/test");
  });

  it("rejects non-3.x OpenAPI version", async () => {
    const specPath = join(tempDir, "swagger.json");
    await writeFile(specPath, JSON.stringify({
      openapi: "2.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    }));

    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      "Unsupported OpenAPI version",
    );
  });

  it("rejects spec without openapi field", async () => {
    const specPath = join(tempDir, "no-openapi.json");
    await writeFile(specPath, JSON.stringify({
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    }));

    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      'Missing or invalid "openapi" field',
    );
  });

  it("rejects spec without info section", async () => {
    const specPath = join(tempDir, "no-info.json");
    await writeFile(specPath, JSON.stringify({
      openapi: "3.0.0",
      paths: {},
    }));

    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      'Missing "info" section',
    );
  });

  it("rejects spec without paths section", async () => {
    const specPath = join(tempDir, "no-paths.json");
    await writeFile(specPath, JSON.stringify({
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
    }));

    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      'Missing "paths" section',
    );
  });

  it("rejects non-object spec (array)", async () => {
    const specPath = join(tempDir, "array.json");
    await writeFile(specPath, JSON.stringify([1, 2, 3]));

    // Array passes typeof === "object" check but fails at openapi field validation
    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      'Missing or invalid "openapi" field',
    );
  });

  it("rejects null spec", async () => {
    const specPath = join(tempDir, "null.json");
    await writeFile(specPath, "null");

    await expect(loadOpenAPISpec(specPath)).rejects.toThrow(
      "must be a valid object",
    );
  });

  it("loads YAML spec file", async () => {
    const specPath = join(tempDir, "openapi.yaml");
    await writeFile(specPath, [
      "openapi: '3.0.3'",
      "info:",
      "  title: YAML Test",
      "  version: '1.0.0'",
      "paths:",
      "  /items: {}",
    ].join("\n"));

    const spec = await loadOpenAPISpec(specPath);
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info.title).toBe("YAML Test");
  });

  it("fetches spec from URL", async () => {
    const mockSpec = {
      openapi: "3.0.3",
      info: { title: "Remote", version: "1.0.0" },
      paths: { "/items": {} },
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockSpec)),
    }));

    const spec = await loadOpenAPISpec("https://api.example.com/spec.json");
    expect(spec.info.title).toBe("Remote");

    vi.unstubAllGlobals();
  });

  it("throws on HTTP error when fetching from URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    }));

    await expect(
      loadOpenAPISpec("https://api.example.com/missing.json"),
    ).rejects.toThrow("Failed to fetch OpenAPI spec");

    vi.unstubAllGlobals();
  });

  it("throws for non-existent local file", async () => {
    await expect(
      loadOpenAPISpec(join(tempDir, "does-not-exist.json")),
    ).rejects.toThrow();
  });
});
