import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("pathExists", () => {
  it("returns true for an existing file", async () => {
    const filePath = join(tempDir, "test.txt");
    await writeFile(filePath, "hello");

    expect(await pathExists(filePath)).toBe(true);
  });

  it("returns true for an existing directory", async () => {
    const dirPath = join(tempDir, "subdir");
    await mkdir(dirPath);

    expect(await pathExists(dirPath)).toBe(true);
  });

  it("returns false for a non-existent path", async () => {
    const fakePath = join(tempDir, "does-not-exist.txt");

    expect(await pathExists(fakePath)).toBe(false);
  });
});
