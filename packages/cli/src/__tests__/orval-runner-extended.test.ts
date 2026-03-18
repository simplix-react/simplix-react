import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  tryImportOrval,
  runOrval,
  narrowResponseTypes,
  addTsNocheckToEndpoints,
  generateEndpointsBarrel,
  deduplicateGeneratedFiles,
  extractSharedEndpointTypes,
  generateSchemasProxy,
  buildHookImportMap,
  pruneUnusedModels,
} from "../openapi/orchestration/orval-runner.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "orval-ext-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function makeSpinner() {
  return {
    text: "",
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  } as unknown as ReturnType<typeof import("ora").default>;
}

// ── tryImportOrval ──────────────────────────────────────────

describe("tryImportOrval", () => {
  it("returns null when orval is not installed", async () => {
    const result = await tryImportOrval(tempDir);
    expect(result).toBeNull();
  });

  it("returns null when projectRoot does not exist", async () => {
    const result = await tryImportOrval("/nonexistent/path/that/does/not/exist");
    expect(result).toBeNull();
  });
});

// ── runOrval ────────────────────────────────────────────────

describe("runOrval", () => {
  it("warns when orval is not found", async () => {
    const spinner = makeSpinner();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runOrval(spinner, tempDir, "test-domain");

    expect(spinner.warn).toHaveBeenCalledWith(
      expect.stringContaining("Orval not found"),
    );
    consoleSpy.mockRestore();
  });

  it("warns when spec info is missing", async () => {
    // Create a mock orval module
    const nodeModules = join(tempDir, "node_modules/orval");
    await mkdir(nodeModules, { recursive: true });
    await writeFile(join(nodeModules, "package.json"), JSON.stringify({ name: "orval", main: "index.js" }));
    await writeFile(join(nodeModules, "index.js"), "module.exports = { generate: async () => {} };");
    await writeFile(join(tempDir, "package.json"), JSON.stringify({ name: "test" }));

    const spinner = makeSpinner();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Run with no specRelativePath and no tags - should warn about missing spec info
    await runOrval(spinner, tempDir, "test-domain", {});

    expect(spinner.warn).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ── extractSharedEndpointTypes (full multi-file scenario) ───

describe("extractSharedEndpointTypes multi-file", () => {
  it("extracts HTTPStatusCode block into shared types file", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });

    const httpBlock = [
      "export type HTTPStatusCode = 200 | 400 | 500;",
      "export type HTTPStatusCodes = HTTPStatusCode[];",
    ].join("\n");

    await writeFile(join(epDir, "user.ts"), `${httpBlock}\nexport function useGetUser() {}\n`);
    await writeFile(join(epDir, "pet.ts"), `${httpBlock}\nexport function useGetPet() {}\n`);

    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(true);

    const sharedContent = await readFile(join(epDir, "_shared-types.ts"), "utf-8");
    expect(sharedContent).toContain("HTTPStatusCode");

    // Original files should have import instead of inline block
    const userContent = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(userContent).toContain('import type { HTTPStatusCode, HTTPStatusCodes } from "./_shared-types"');
  });

  it("returns false when no HTTPStatusCode block found", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), "export function useGetUser() {}\n");
    await writeFile(join(epDir, "pet.ts"), "export function useGetPet() {}\n");

    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(false);
  });
});

// ── deduplicateGeneratedFiles extended ──────────────────────

describe("deduplicateGeneratedFiles extended", () => {
  it("removes duplicate const exports while preserving first", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "pet.ts"), [
      "export const petStatus = ['available', 'pending'] as const;",
      "",
      "export const petStatus = ['available', 'pending'] as const;",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);
  });

  it("removes duplicate interface exports", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "user.ts"), [
      "export interface User { id: string; }",
      "",
      "export interface User { id: string; }",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);
  });

  it("allows type+const same name coexistence (companion pattern)", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "status.ts"), [
      "export type Status = 'active' | 'inactive';",
      "export const Status = ['active', 'inactive'] as const;",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBe(0);
  });

  it("does not deduplicate function exports (overloads)", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "hooks.ts"), [
      "export function useGetUser(id: string): void;",
      "export function useGetUser(id: number): void;",
      "export function useGetUser(id: string | number): void {}",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBe(0);
  });

  it("handles endpoint files in tags-split mode (nested dirs)", async () => {
    const epDir = join(tempDir, "src/generated/endpoints/pet");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "pet.ts"), [
      "export type PetResponse = { id: string };",
      "",
      "export type PetResponse = { id: string };",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);
  });

  it("removes preceding JSDoc/blank/import lines for duplicate block", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "pet.ts"), [
      "export type Pet = { id: string };",
      "",
      "/**",
      " * Pet type",
      " */",
      "export type Pet = { id: string };",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "pet.ts"), "utf-8");
    expect(content.match(/export type Pet/g)).toHaveLength(1);
  });
});

// ── pruneUnusedModels extended ──────────────────────────────

describe("pruneUnusedModels extended", () => {
  it("follows transitive dependencies", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(modelDir, { recursive: true });
    await mkdir(epDir, { recursive: true });

    // Model files: user depends on role, role has no deps
    await writeFile(join(modelDir, "user.ts"), 'import type { Role } from "./role";\nexport type User = { id: string; role: Role };\n');
    await writeFile(join(modelDir, "role.ts"), "export type Role = 'admin' | 'user';\n");
    await writeFile(join(modelDir, "unused.ts"), "export type Unused = { x: number };\n");
    await writeFile(join(modelDir, "index.ts"), 'export * from "./user";\nexport * from "./role";\nexport * from "./unused";\n');

    // Endpoint imports User (which transitively needs Role)
    await writeFile(join(epDir, "user.ts"), 'import type { User } from "../model";\nexport function useGetUser(): User { return {} as User; }\n');

    const pruned = await pruneUnusedModels(tempDir);
    expect(pruned).toBe(1); // Only unused.ts should be deleted

    const indexContent = await readFile(join(modelDir, "index.ts"), "utf-8");
    expect(indexContent).toContain("user");
    expect(indexContent).toContain("role");
    expect(indexContent).not.toContain("unused");
  });

  it("returns 0 when no root types are imported", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(modelDir, { recursive: true });
    await mkdir(epDir, { recursive: true });

    await writeFile(join(modelDir, "user.ts"), "export type User = { id: string };\n");
    await writeFile(join(modelDir, "index.ts"), 'export * from "./user";\n');

    // Endpoint file does not import from model
    await writeFile(join(epDir, "user.ts"), "export function useGetUser() {}\n");

    const pruned = await pruneUnusedModels(tempDir);
    expect(pruned).toBe(0);
  });

  it("handles nested endpoint files (tags-split)", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    const epDir = join(tempDir, "src/generated/endpoints/pet");
    await mkdir(modelDir, { recursive: true });
    await mkdir(epDir, { recursive: true });

    await writeFile(join(modelDir, "pet.ts"), "export type Pet = { id: string };\n");
    await writeFile(join(modelDir, "unused.ts"), "export type Unused = {};\n");
    await writeFile(join(modelDir, "index.ts"), 'export * from "./pet";\nexport * from "./unused";\n');

    await writeFile(join(epDir, "pet.ts"), 'import type { Pet } from "../../model";\nexport function useGetPet(): Pet { return {} as Pet; }\n');

    const pruned = await pruneUnusedModels(tempDir);
    expect(pruned).toBe(1);
  });
});

// ── generateSchemasProxy extended ───────────────────────────

describe("generateSchemasProxy extended", () => {
  it("does nothing if endpoints dir does not exist", async () => {
    await generateSchemasProxy(tempDir);
    // No error thrown, no file created
  });

  it("handles multiple zod files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.zod.ts"), "export const userSchema = 1;\n");
    await writeFile(join(epDir, "pet.zod.ts"), "export const petSchema = 1;\n");

    await generateSchemasProxy(tempDir);

    const content = await readFile(join(tempDir, "src/schemas.ts"), "utf-8");
    expect(content).toContain("user.zod");
    expect(content).toContain("pet.zod");
  });
});

// ── narrowResponseTypes with nested dirs ────────────────────

describe("narrowResponseTypes extended", () => {
  it("narrows types in nested endpoint dirs (tags-split)", async () => {
    const epDir = join(tempDir, "src/generated/endpoints/pet");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "pet.ts"), "export type getPetResponse = getPetResponseSuccess | getPetResponseError;\n");

    await narrowResponseTypes(tempDir);

    const content = await readFile(join(epDir, "pet.ts"), "utf-8");
    expect(content).toBe("export type getPetResponse = getPetResponseSuccess;\n");
  });

  it("skips _ prefixed files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "_shared-types.ts"), "export type HTTPStatusCode = 200;\n");

    await narrowResponseTypes(tempDir);

    const content = await readFile(join(epDir, "_shared-types.ts"), "utf-8");
    expect(content).toBe("export type HTTPStatusCode = 200;\n");
  });
});

// ── buildHookImportMap with nested dirs ─────────────────────

describe("buildHookImportMap extended", () => {
  it("maps hooks from nested endpoint dirs", async () => {
    const epDir = join(tempDir, "src/generated/endpoints/pet");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "pet.ts"), "export function useGetPet() {}\nexport const useListPets = () => {};\n");

    const map = await buildHookImportMap(tempDir);
    expect(map.get("useGetPet")).toBe("../generated/endpoints/pet/pet");
    expect(map.get("useListPets")).toBe("../generated/endpoints/pet/pet");
  });
});

// ── generateEndpointsBarrel with nested dirs ────────────────

describe("generateEndpointsBarrel extended", () => {
  it("generates barrel for nested (tags-split) structure", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    const petDir = join(epDir, "pet");
    const userDir = join(epDir, "user");
    await mkdir(petDir, { recursive: true });
    await mkdir(userDir, { recursive: true });
    await writeFile(join(petDir, "pet.ts"), "export const a = 1;\n");
    await writeFile(join(userDir, "user.ts"), "export const b = 1;\n");

    await generateEndpointsBarrel(tempDir);

    const content = await readFile(join(epDir, "index.ts"), "utf-8");
    expect(content).toContain('export * from "./pet/pet";');
    expect(content).toContain('export * from "./user/user";');
  });
});

// ── addTsNocheckToEndpoints with nested dirs ────────────────

describe("addTsNocheckToEndpoints extended", () => {
  it("adds @ts-nocheck to nested endpoint files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints/pet");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "pet.ts"), "export const a = 1;\n");

    await addTsNocheckToEndpoints(tempDir);

    const content = await readFile(join(epDir, "pet.ts"), "utf-8");
    expect(content.startsWith("// @ts-nocheck\n")).toBe(true);
  });
});
