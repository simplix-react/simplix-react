import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  extractMutatorStrategy,
  generateDomainMutatorContent,
  collectEndpointFiles,
  narrowResponseTypes,
  addTsNocheckToEndpoints,
  generateEndpointsBarrel,
  deduplicateGeneratedFiles,
  extractSharedEndpointTypes,
  generateSchemasProxy,
  buildHookImportMap,
  pruneUnusedModels,
} from "../openapi/orchestration/orval-runner.js";
import { readFile } from "node:fs/promises";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "orval-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

// ── extractMutatorStrategy ──────────────────────────────────

describe("extractMutatorStrategy", () => {
  it("extracts strategy from getMutator with string arg", () => {
    const content = `return getMutator("boot")<T>(url, options);`;
    expect(extractMutatorStrategy(content)).toBe("boot");
  });

  it("returns undefined for default getMutator (no arg)", () => {
    const content = `return getMutator()<T>(url, options);`;
    expect(extractMutatorStrategy(content)).toBeUndefined();
  });

  it("returns undefined when no getMutator found", () => {
    const content = `export const foo = "bar";`;
    expect(extractMutatorStrategy(content)).toBeUndefined();
  });
});

// ── generateDomainMutatorContent ────────────────────────────

describe("generateDomainMutatorContent", () => {
  it("generates default mutator without strategy", () => {
    const content = generateDomainMutatorContent("user");
    expect(content).toContain("getMutator()");
    expect(content).toContain("customFetch");
    expect(content).toContain("ErrorType");
    expect(content).toContain("BodyType");
  });

  it("generates mutator with boot strategy", () => {
    const content = generateDomainMutatorContent("user", "boot");
    expect(content).toContain('getMutator("boot")');
  });

  it("generates default mutator for 'default' strategy", () => {
    const content = generateDomainMutatorContent("user", "default");
    expect(content).toContain("getMutator()");
  });
});

// ── collectEndpointFiles ────────────────────────────────────

describe("collectEndpointFiles", () => {
  it("collects flat .ts files", async () => {
    const dir = join(tempDir, "endpoints");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "user.ts"), "export const foo = 1;");
    await writeFile(join(dir, "pet.ts"), "export const bar = 1;");

    const files = await collectEndpointFiles(dir);
    expect(files.sort()).toEqual(["pet.ts", "user.ts"]);
  });

  it("collects nested files (tags-split mode)", async () => {
    const dir = join(tempDir, "endpoints");
    const subdir = join(dir, "pet");
    await mkdir(subdir, { recursive: true });
    await writeFile(join(subdir, "pet.ts"), "export const a = 1;");

    const files = await collectEndpointFiles(dir);
    expect(files).toContain("pet/pet.ts");
  });

  it("ignores non-ts files", async () => {
    const dir = join(tempDir, "endpoints");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "readme.md"), "# Hi");
    await writeFile(join(dir, "user.ts"), "export const a = 1;");

    const files = await collectEndpointFiles(dir);
    expect(files).toEqual(["user.ts"]);
  });
});

// ── narrowResponseTypes ─────────────────────────────────────

describe("narrowResponseTypes", () => {
  it("narrows single-line response union types", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export type getUserResponse = getUserResponseSuccess | getUserResponseError;\n");

    await narrowResponseTypes(tempDir);

    const content = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(content).toBe("export type getUserResponse = getUserResponseSuccess;\n");
  });

  it("narrows multi-line response union types", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    const multiLine = "export type getUserResponse =\n  | getUserResponseSuccess\n  | getUserResponseError;\n";
    await writeFile(join(epDir, "user.ts"), multiLine);

    await narrowResponseTypes(tempDir);

    const content = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(content).toBe("export type getUserResponse = getUserResponseSuccess;\n");
  });

  it("skips .msw.ts and .zod.ts files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    const original = "export type foo = fooSuccess | fooError;\n";
    await writeFile(join(epDir, "user.msw.ts"), original);
    await writeFile(join(epDir, "user.zod.ts"), original);

    await narrowResponseTypes(tempDir);

    const msw = await readFile(join(epDir, "user.msw.ts"), "utf-8");
    const zod = await readFile(join(epDir, "user.zod.ts"), "utf-8");
    expect(msw).toBe(original);
    expect(zod).toBe(original);
  });

  it("does nothing if endpoints dir does not exist", async () => {
    // Should not throw
    await narrowResponseTypes(tempDir);
  });
});

// ── addTsNocheckToEndpoints ─────────────────────────────────

describe("addTsNocheckToEndpoints", () => {
  it("prepends @ts-nocheck to endpoint files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");

    await addTsNocheckToEndpoints(tempDir);

    const content = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(content.startsWith("// @ts-nocheck\n")).toBe(true);
  });

  it("does not double-add @ts-nocheck", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "// @ts-nocheck\nexport const a = 1;\n");

    await addTsNocheckToEndpoints(tempDir);

    const content = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(content).toBe("// @ts-nocheck\nexport const a = 1;\n");
  });

  it("does nothing if endpoints dir does not exist", async () => {
    await addTsNocheckToEndpoints(tempDir);
  });
});

// ── generateEndpointsBarrel ─────────────────────────────────

describe("generateEndpointsBarrel", () => {
  it("generates index.ts with re-exports", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");
    await writeFile(join(epDir, "pet.ts"), "export const b = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const content = await readFile(join(epDir, "index.ts"), "utf-8");
    expect(content).toContain('export * from "./pet";');
    expect(content).toContain('export * from "./user";');
  });

  it("skips .msw.ts, .zod.ts, and index.ts files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");
    await writeFile(join(epDir, "user.msw.ts"), "export const b = 1;\n");
    await writeFile(join(epDir, "user.zod.ts"), "export const c = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const content = await readFile(join(epDir, "index.ts"), "utf-8");
    expect(content).toContain('export * from "./user";');
    expect(content).not.toContain("msw");
    expect(content).not.toContain("zod");
  });

  it("adds @ts-nocheck for multi-file mode without shared types", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");
    await writeFile(join(epDir, "pet.ts"), "export const b = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const content = await readFile(join(epDir, "index.ts"), "utf-8");
    expect(content.startsWith("// @ts-nocheck\n")).toBe(true);
  });

  it("does not add @ts-nocheck when shared types exist", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");
    await writeFile(join(epDir, "pet.ts"), "export const b = 1;\n");
    await writeFile(join(epDir, "_shared-types.ts"), "export type X = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const content = await readFile(join(epDir, "index.ts"), "utf-8");
    expect(content.startsWith("// @ts-nocheck")).toBe(false);
  });

  it("does nothing if endpoints dir does not exist", async () => {
    await generateEndpointsBarrel(tempDir);
  });

  it("does nothing when no main endpoint files exist", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.msw.ts"), "export const a = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const exists = await readFile(join(epDir, "index.ts"), "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });
});

// ── deduplicateGeneratedFiles ───────────────────────────────

describe("deduplicateGeneratedFiles", () => {
  it("removes duplicate type exports", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "user.ts"), [
      "export type User = { id: string };",
      "",
      "export type User = { id: string };",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "user.ts"), "utf-8");
    const matches = content.match(/export type User/g);
    expect(matches).toHaveLength(1);
  });

  it("returns 0 when no duplicates exist", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "user.ts"), "export type User = { id: string };\n");

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBe(0);
  });

  it("does nothing if model dir does not exist", async () => {
    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBe(0);
  });
});

// ── generateSchemasProxy ────────────────────────────────────

describe("generateSchemasProxy", () => {
  it("generates schemas.ts with zod file re-exports", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.zod.ts"), "export const userSchema = 1;\n");

    await generateSchemasProxy(tempDir);

    const content = await readFile(join(tempDir, "src/schemas.ts"), "utf-8");
    expect(content).toContain('export * from "./generated/endpoints/user.zod";');
    expect(content).toContain("Custom schema overrides");
  });

  it("preserves custom section from existing file", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.zod.ts"), "export const a = 1;\n");

    // Create existing schemas.ts with custom overrides
    await mkdir(join(tempDir, "src"), { recursive: true });
    const customContent = [
      'export * from "./generated/endpoints/old.zod";',
      "",
      "// Custom schema overrides and additions:",
      'import { z } from "zod";',
      "export const mySchema = z.object({ x: z.string() });",
    ].join("\n");
    await writeFile(join(tempDir, "src/schemas.ts"), customContent);

    await generateSchemasProxy(tempDir);

    const content = await readFile(join(tempDir, "src/schemas.ts"), "utf-8");
    expect(content).toContain('export * from "./generated/endpoints/user.zod";');
    expect(content).toContain("export const mySchema");
    expect(content).not.toContain("old.zod");
  });

  it("does nothing if no zod files exist", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export const a = 1;\n");

    await generateSchemasProxy(tempDir);

    const exists = await readFile(join(tempDir, "src/schemas.ts"), "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });
});

// ── buildHookImportMap ──────────────────────────────────────

describe("buildHookImportMap", () => {
  it("builds map of hook names to import paths", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export function useGetUser() {}\nexport const useListUsers = () => {};\n");

    const map = await buildHookImportMap(tempDir);
    expect(map.get("useGetUser")).toBe("../generated/endpoints/user");
    expect(map.get("useListUsers")).toBe("../generated/endpoints/user");
  });

  it("returns empty map if endpoints dir does not exist", async () => {
    const map = await buildHookImportMap(tempDir);
    expect(map.size).toBe(0);
  });

  it("skips .msw.ts and .zod.ts files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.msw.ts"), "export function useGetUser() {}\n");
    await writeFile(join(epDir, "user.zod.ts"), "export const useSchema = 1;\n");

    const map = await buildHookImportMap(tempDir);
    expect(map.size).toBe(0);
  });
});

// ── extractSharedEndpointTypes ──────────────────────────────

describe("extractSharedEndpointTypes", () => {
  it("returns false if endpoints dir does not exist", async () => {
    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(false);
  });

  it("returns false for single file mode", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export type HTTPStatusCode = 200;\n");

    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(false);
  });
});

// ── pruneUnusedModels ───────────────────────────────────────

describe("pruneUnusedModels", () => {
  it("returns 0 if model dir does not exist", async () => {
    const result = await pruneUnusedModels(tempDir);
    expect(result).toBe(0);
  });

  it("returns 0 if endpoints dir does not exist", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "user.ts"), "export type User = {};\n");
    await writeFile(join(modelDir, "index.ts"), 'export * from "./user";\n');

    const result = await pruneUnusedModels(tempDir);
    expect(result).toBe(0);
  });

  it("prunes unused model files", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(modelDir, { recursive: true });
    await mkdir(epDir, { recursive: true });

    // Model files
    await writeFile(join(modelDir, "user.ts"), "export type User = { id: string };\n");
    await writeFile(join(modelDir, "unused.ts"), "export type Unused = { x: number };\n");
    await writeFile(join(modelDir, "index.ts"), 'export * from "./user";\nexport * from "./unused";\n');

    // Endpoint file imports only User
    await writeFile(join(epDir, "user.ts"), 'import type { User } from "../model";\nexport function useGetUser(): User { return {} as User; }\n');

    const pruned = await pruneUnusedModels(tempDir);
    expect(pruned).toBe(1);

    const indexContent = await readFile(join(modelDir, "index.ts"), "utf-8");
    expect(indexContent).toContain("user");
    expect(indexContent).not.toContain("unused");
  });
});
