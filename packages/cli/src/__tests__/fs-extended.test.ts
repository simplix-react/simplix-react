import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ensureDir,
  writeFileWithDir,
  readJsonFile,
  resolveFromRoot,
  findProjectRoot,
} from "../utils/fs.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-fs-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("ensureDir", () => {
  it("creates a directory if it does not exist", async () => {
    const dir = join(tempDir, "new-dir");
    await ensureDir(dir);

    const { stat } = await import("node:fs/promises");
    const s = await stat(dir);
    expect(s.isDirectory()).toBe(true);
  });

  it("does not throw if directory already exists", async () => {
    const dir = join(tempDir, "existing-dir");
    await mkdir(dir);

    await expect(ensureDir(dir)).resolves.toBeUndefined();
  });

  it("creates nested directories recursively", async () => {
    const dir = join(tempDir, "a", "b", "c");
    await ensureDir(dir);

    const { stat } = await import("node:fs/promises");
    const s = await stat(dir);
    expect(s.isDirectory()).toBe(true);
  });
});

describe("writeFileWithDir", () => {
  it("creates parent directories and writes file", async () => {
    const filePath = join(tempDir, "nested", "deep", "file.txt");
    await writeFileWithDir(filePath, "hello world");

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("hello world");
  });

  it("overwrites existing file", async () => {
    const filePath = join(tempDir, "overwrite.txt");
    await writeFile(filePath, "old content");
    await writeFileWithDir(filePath, "new content");

    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("new content");
  });
});

describe("readJsonFile", () => {
  it("reads and parses a JSON file", async () => {
    const filePath = join(tempDir, "data.json");
    await writeFile(filePath, JSON.stringify({ name: "test", count: 42 }));

    const data = await readJsonFile<{ name: string; count: number }>(filePath);
    expect(data.name).toBe("test");
    expect(data.count).toBe(42);
  });

  it("throws for invalid JSON", async () => {
    const filePath = join(tempDir, "invalid.json");
    await writeFile(filePath, "not json");

    await expect(readJsonFile(filePath)).rejects.toThrow();
  });
});

describe("resolveFromRoot", () => {
  it("joins root with segments", () => {
    const result = resolveFromRoot("/project", "packages", "cli");
    expect(result).toBe("/project/packages/cli");
  });

  it("handles single segment", () => {
    const result = resolveFromRoot("/project", "package.json");
    expect(result).toBe("/project/package.json");
  });
});

describe("findProjectRoot", () => {
  it("finds root with simplix.config.ts", async () => {
    await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
    const subDir = join(tempDir, "packages", "cli");
    await mkdir(subDir, { recursive: true });

    const root = await findProjectRoot(subDir);
    expect(root).toBe(tempDir);
  });

  it("finds root with pnpm-workspace.yaml", async () => {
    await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:");
    const subDir = join(tempDir, "packages", "cli");
    await mkdir(subDir, { recursive: true });

    const root = await findProjectRoot(subDir);
    expect(root).toBe(tempDir);
  });

  it("prefers simplix.config.ts over pnpm-workspace.yaml", async () => {
    // Both markers at the same level
    await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
    await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:");

    const root = await findProjectRoot(tempDir);
    expect(root).toBe(tempDir);
  });

  it("returns startDir when no marker is found", async () => {
    const subDir = join(tempDir, "no-marker");
    await mkdir(subDir, { recursive: true });

    const root = await findProjectRoot(subDir);
    // Should resolve to the absolute path of subDir
    expect(root).toContain("no-marker");
  });
});
