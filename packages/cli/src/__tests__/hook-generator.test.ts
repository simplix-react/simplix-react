import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateHookFiles } from "../openapi/generation/hook-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "hook-gen-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function makeEntity(overrides: Partial<ExtractedEntity> = {}): ExtractedEntity {
  return {
    name: "user",
    pascalName: "User",
    pluralName: "users",
    path: "/users",
    fields: [],
    queryParams: [],
    operations: [
      { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, operationId: "listUsers", queryParams: [] },
      { name: "get", method: "GET", path: "/users/:id", role: "get", hasInput: false, operationId: "getUserById", queryParams: [] },
    ],
    tags: [],
    ...overrides,
  };
}

describe("generateHookFiles", () => {
  it("generates hook files with barrel export", async () => {
    const entity = makeEntity();
    await generateHookFiles(tempDir, [entity]);

    const hooksDir = join(tempDir, "src/hooks");
    const barrelContent = await readFile(join(hooksDir, "index.ts"), "utf-8");
    expect(barrelContent).toContain('export * from "./user";');

    const entityContent = await readFile(join(hooksDir, "user.ts"), "utf-8");
    expect(entityContent).toContain('export * from "../generated/endpoints"');
  });

  it("uses hookImportMap for per-file imports", async () => {
    const entity = makeEntity();
    const importMap = new Map([
      ["useListUsers", "../generated/endpoints/user"],
      ["useGetUserById", "../generated/endpoints/user"],
    ]);

    await generateHookFiles(tempDir, [entity], importMap);

    const entityContent = await readFile(join(tempDir, "src/hooks/user.ts"), "utf-8");
    expect(entityContent).toContain('export * from "../generated/endpoints/user"');
  });

  it("does nothing for empty entities", async () => {
    await generateHookFiles(tempDir, []);

    const exists = await readFile(join(tempDir, "src/hooks/index.ts"), "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });

  it("skips entities with no operations that have operationId", async () => {
    const entity = makeEntity({
      operations: [
        { name: "custom", method: "GET", path: "/users/custom", hasInput: false, queryParams: [] },
      ],
    });

    await generateHookFiles(tempDir, [entity]);

    // entity file should not be generated since no operationIds
    const exists = await readFile(join(tempDir, "src/hooks/user.ts"), "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });

  it("generates multiple entity files", async () => {
    const users = makeEntity();
    const pets: ExtractedEntity = {
      name: "pet",
      pascalName: "Pet",
      pluralName: "pets",
      path: "/pets",
      fields: [],
      queryParams: [],
      operations: [
        { name: "list", method: "GET", path: "/pets", role: "list", hasInput: false, operationId: "listPets", queryParams: [] },
      ],
      tags: [],
    };

    await generateHookFiles(tempDir, [users, pets]);

    const barrelContent = await readFile(join(tempDir, "src/hooks/index.ts"), "utf-8");
    expect(barrelContent).toContain('export * from "./user"');
    expect(barrelContent).toContain('export * from "./pet"');
  });

  it("uses resolvedHookName when available", async () => {
    const entity = makeEntity({
      operations: [
        {
          name: "list",
          method: "GET",
          path: "/users",
          role: "list",
          hasInput: false,
          operationId: "listUsers",
          resolvedHookName: "useGetAllUsers",
          queryParams: [],
        },
      ],
    });

    const importMap = new Map([
      ["useGetAllUsers", "../generated/endpoints/custom-user"],
    ]);

    await generateHookFiles(tempDir, [entity], importMap);

    const entityContent = await readFile(join(tempDir, "src/hooks/user.ts"), "utf-8");
    expect(entityContent).toContain("custom-user");
  });
});
