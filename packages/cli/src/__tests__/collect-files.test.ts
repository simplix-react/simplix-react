import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectTsFiles } from "../utils/collect-files.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("collectTsFiles", () => {
  it("collects .ts files from a flat directory", async () => {
    await writeFile(join(tempDir, "index.ts"), "export {};");
    await writeFile(join(tempDir, "utils.ts"), "export {};");

    const files = await collectTsFiles(tempDir);

    expect(files).toHaveLength(2);
    expect(files).toContain(join(tempDir, "index.ts"));
    expect(files).toContain(join(tempDir, "utils.ts"));
  });

  it("collects .tsx files alongside .ts files", async () => {
    await writeFile(join(tempDir, "app.tsx"), "export {};");
    await writeFile(join(tempDir, "util.ts"), "export {};");

    const files = await collectTsFiles(tempDir);

    expect(files).toHaveLength(2);
    expect(files).toContain(join(tempDir, "app.tsx"));
    expect(files).toContain(join(tempDir, "util.ts"));
  });

  it("recursively walks nested directories", async () => {
    const nested = join(tempDir, "a", "b");
    await mkdir(nested, { recursive: true });
    await writeFile(join(tempDir, "root.ts"), "export {};");
    await writeFile(join(nested, "deep.ts"), "export {};");

    const files = await collectTsFiles(tempDir);

    expect(files).toHaveLength(2);
    expect(files).toContain(join(tempDir, "root.ts"));
    expect(files).toContain(join(nested, "deep.ts"));
  });

  it("excludes non-.ts files", async () => {
    await writeFile(join(tempDir, "index.ts"), "export {};");
    await writeFile(join(tempDir, "data.json"), "{}");
    await writeFile(join(tempDir, "script.js"), "module.exports = {};");
    await writeFile(join(tempDir, "readme.md"), "# readme");

    const files = await collectTsFiles(tempDir);

    expect(files).toHaveLength(1);
    expect(files).toContain(join(tempDir, "index.ts"));
  });

  it("skips node_modules directories", async () => {
    const nmDir = join(tempDir, "node_modules", "some-pkg");
    await mkdir(nmDir, { recursive: true });
    await writeFile(join(nmDir, "index.ts"), "export {};");
    await writeFile(join(tempDir, "app.ts"), "export {};");

    const files = await collectTsFiles(tempDir);

    expect(files).toHaveLength(1);
    expect(files).toContain(join(tempDir, "app.ts"));
  });

  it("returns empty array for empty directory", async () => {
    const files = await collectTsFiles(tempDir);

    expect(files).toEqual([]);
  });

  it("returns empty array for non-existent directory", async () => {
    const fakePath = join(tempDir, "does-not-exist");

    const files = await collectTsFiles(fakePath);

    expect(files).toEqual([]);
  });
});
