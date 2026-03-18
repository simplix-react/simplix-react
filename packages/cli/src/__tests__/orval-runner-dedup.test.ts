import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  deduplicateGeneratedFiles,
  extractSharedEndpointTypes,
} from "../openapi/orchestration/orval-runner.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "dedup-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

// ── deduplicateFile edge cases ──────────────────────────────

describe("deduplicateGeneratedFiles - deduplicateFile edge cases", () => {
  it("removes duplicate type with multi-line body and preserves subsequent content", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "pet.ts"), [
      "export type Pet = {",
      "  id: string;",
      "  name: string;",
      "};",
      "",
      "export function useGetPet(): void {}",
      "",
      "export type Pet = {",
      "  id: string;",
      "  name: string;",
      "};",
      "",
      "export function useListPets(): void {}",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "pet.ts"), "utf-8");
    const typeMatches = content.match(/export type Pet/g);
    expect(typeMatches).toHaveLength(1);

    // Function exports should be preserved (not deduplicated)
    expect(content).toContain("useGetPet");
    expect(content).toContain("useListPets");
  });

  it("removes duplicate enum exports", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "status.ts"), [
      "export enum Status { Active = 'active', Inactive = 'inactive' }",
      "",
      "export enum Status { Active = 'active', Inactive = 'inactive' }",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "status.ts"), "utf-8");
    const matches = content.match(/export enum Status/g);
    expect(matches).toHaveLength(1);
  });

  it("handles duplicate with preceding import type lines", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "item.ts"), [
      'import type { Category } from "./category";',
      "export type Item = { id: string; category: Category };",
      "",
      'import type { Category } from "./category";',
      "export type Item = { id: string; category: Category };",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "item.ts"), "utf-8");
    const typeMatches = content.match(/export type Item/g);
    expect(typeMatches).toHaveLength(1);
  });

  it("handles skip-until-next-export for multi-line duplicate blocks", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    // Simulate Orval output with multi-line duplicate type followed by valid export
    await writeFile(join(modelDir, "complex.ts"), [
      "export type Foo = {",
      "  a: string;",
      "  b: number;",
      "};",
      "",
      "export const bar = 'bar';",
      "",
      "export type Foo = {",
      "  a: string;",
      "  b: number;",
      "};",
      "",
      "export const baz = 'baz';",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "complex.ts"), "utf-8");
    expect(content.match(/export type Foo/g)).toHaveLength(1);
    expect(content).toContain("export const bar");
    expect(content).toContain("export const baz");
  });

  it("handles duplicate type in endpoint files (not just model)", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    await mkdir(epDir, { recursive: true });
    await writeFile(join(epDir, "user.ts"), [
      "export type UserResponse = { id: string };",
      "",
      "export function useGetUser() {}",
      "",
      "export type UserResponse = { id: string };",
      "",
      "export function useListUsers() {}",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(content.match(/export type UserResponse/g)).toHaveLength(1);
    // Functions should both be preserved
    expect(content).toContain("useGetUser");
    expect(content).toContain("useListUsers");
  });

  it("handles file with JSDoc before duplicate export", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "doc.ts"), [
      "export type Doc = { id: string };",
      "",
      "/**",
      " * Duplicate doc type",
      " */",
      "export type Doc = { id: string };",
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBeGreaterThan(0);

    const content = await readFile(join(modelDir, "doc.ts"), "utf-8");
    expect(content.match(/export type Doc/g)).toHaveLength(1);
    // JSDoc should be removed along with the duplicate
    expect(content).not.toContain("Duplicate doc type");
  });

  it("skips index.ts files in model dir", async () => {
    const modelDir = join(tempDir, "src/generated/model");
    await mkdir(modelDir, { recursive: true });
    await writeFile(join(modelDir, "index.ts"), [
      'export * from "./user";',
      'export * from "./user";',
    ].join("\n"));

    const removed = await deduplicateGeneratedFiles(tempDir);
    expect(removed).toBe(0);
  });
});

// ── extractSharedEndpointTypes nested dirs ──────────────────

describe("extractSharedEndpointTypes nested dirs", () => {
  it("handles tags-split nested dirs with correct import depth", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    const petDir = join(epDir, "pet");
    const userDir = join(epDir, "user");
    await mkdir(petDir, { recursive: true });
    await mkdir(userDir, { recursive: true });

    const httpBlock = [
      "export type HTTPStatusCode = 200 | 400 | 500;",
      "export type HTTPStatusCodes = HTTPStatusCode[];",
    ].join("\n");

    await writeFile(join(petDir, "pet.ts"), `${httpBlock}\nexport function useGetPet() {}\n`);
    await writeFile(join(userDir, "user.ts"), `${httpBlock}\nexport function useGetUser() {}\n`);

    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(true);

    // Nested files should have "../" prefix in import
    const petContent = await readFile(join(petDir, "pet.ts"), "utf-8");
    expect(petContent).toContain('from "../_shared-types"');

    const userContent = await readFile(join(userDir, "user.ts"), "utf-8");
    expect(userContent).toContain('from "../_shared-types"');
  });

  it("handles mixed flat and nested files", async () => {
    const epDir = join(tempDir, "src/generated/endpoints");
    const petDir = join(epDir, "pet");
    await mkdir(petDir, { recursive: true });

    const httpBlock = [
      "export type HTTPStatusCode = 200 | 400 | 500;",
      "export type HTTPStatusCodes = HTTPStatusCode[];",
    ].join("\n");

    // One flat file, one nested
    await writeFile(join(epDir, "user.ts"), `${httpBlock}\nexport function useGetUser() {}\n`);
    await writeFile(join(petDir, "pet.ts"), `${httpBlock}\nexport function useGetPet() {}\n`);

    const result = await extractSharedEndpointTypes(tempDir);
    expect(result).toBe(true);

    // Flat file uses "./" prefix
    const userContent = await readFile(join(epDir, "user.ts"), "utf-8");
    expect(userContent).toContain('from "./_shared-types"');

    // Nested file uses "../" prefix
    const petContent = await readFile(join(petDir, "pet.ts"), "utf-8");
    expect(petContent).toContain('from "../_shared-types"');
  });
});
