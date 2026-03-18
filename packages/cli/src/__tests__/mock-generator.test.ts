import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateMockFiles } from "../openapi/generation/mock-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "mock-gen-test-"));
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
    fields: [
      { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
      { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
    ],
    queryParams: [],
    operations: [
      { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      { name: "get", method: "GET", path: "/users/:id", role: "get", hasInput: false, queryParams: [] },
      { name: "create", method: "POST", path: "/users", role: "create", hasInput: true, queryParams: [] },
      { name: "update", method: "PATCH", path: "/users/:id", role: "update", hasInput: true, queryParams: [] },
      { name: "delete", method: "DELETE", path: "/users/:id", role: "delete", hasInput: false, queryParams: [] },
    ],
    tags: [],
    ...overrides,
  };
}

describe("generateMockFiles", () => {
  it("generates handlers.ts with entity handler functions", async () => {
    const entity = makeEntity();

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");

    expect(content).toContain("import { http, HttpResponse }");
    expect(content).toContain("createUserHandlers");
    expect(content).toContain("MockEntityStore");
  });

  it("generates mock/index.ts on first creation", async () => {
    const entity = makeEntity();

    await generateMockFiles(tempDir, "test", [entity]);

    const entryPath = join(tempDir, "src/mock/index.ts");
    const content = await readFile(entryPath, "utf-8");

    expect(content).toContain("createTestMock");
    expect(content).toContain("MockDomainConfig");
  });

  it("does not overwrite existing mock/index.ts", async () => {
    const entity = makeEntity();

    const entryDir = join(tempDir, "src/mock");
    await mkdir(entryDir, { recursive: true });
    await writeFile(join(entryDir, "index.ts"), "// custom content\n");

    await generateMockFiles(tempDir, "test", [entity]);

    const content = await readFile(join(entryDir, "index.ts"), "utf-8");
    expect(content).toBe("// custom content\n");
  });

  it("skips seed generation if seeds.ts exists", async () => {
    const entity = makeEntity();

    const seedDir = join(tempDir, "src/mock");
    await mkdir(seedDir, { recursive: true });
    await writeFile(join(seedDir, "seeds.ts"), "// existing seeds\n");

    await generateMockFiles(tempDir, "test", [entity]);

    const content = await readFile(join(seedDir, "seeds.ts"), "utf-8");
    expect(content).toBe("// existing seeds\n");
  });

  it("skips generation when no operations", async () => {
    const entity = makeEntity({ operations: [] });

    await generateMockFiles(tempDir, "test", [entity]);

    // handlers.ts should not be created if no ops
    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const exists = await readFile(handlersPath, "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });

  it("generates seeds.ts for entities with fields", async () => {
    const entity = makeEntity();

    await generateMockFiles(tempDir, "test", [entity]);

    const seedsPath = join(tempDir, "src/mock/seeds.ts");
    const content = await readFile(seedsPath, "utf-8");
    expect(content).toContain("userSeeds");
  });

  it("handles entity with list query params in handler", async () => {
    const entity = makeEntity({
      operations: [
        {
          name: "list",
          method: "GET",
          path: "/users",
          role: "list",
          hasInput: false,
          queryParams: [{ name: "status", type: "string", required: false }],
        },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("status");
  });

  it("handles entity with numeric id field", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", format: "int64", zodType: "z.number()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("Number(params");
  });

  it("handles entities with no fields (skip seeds)", async () => {
    const entity = makeEntity({
      fields: [],
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const seedsPath = join(tempDir, "src/mock/seeds.ts");
    const exists = await readFile(seedsPath, "utf-8").catch(() => null);
    expect(exists).toBeNull();
  });

  it("handles search role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "search", method: "POST", path: "/users/search", role: "search", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("post");
    expect(content).toContain("listPaged");
  });

  it("handles batchDelete role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "batchDelete", method: "DELETE", path: "/users/batch", role: "batchDelete", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("delete");
  });

  it("handles getAll role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "getAll", method: "GET", path: "/users", role: "getAll", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("store.list()");
  });

  it("handles update (PUT) role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "PUT", path: "/users/:id", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("put");
    expect(content).toContain("store.update");
  });

  it("handles multiUpdate role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "multiUpdate", method: "PATCH", path: "/users", role: "multiUpdate", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("patch");
    expect(content).toContain("store.update");
  });

  it("handles getForEdit role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "getForEdit", method: "GET", path: "/users/:id/edit", role: "getForEdit", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("get");
    expect(content).toContain("store.getById");
  });

  it("handles entity with DELETE void response", async () => {
    const entity = makeEntity({
      operations: [
        { name: "delete", method: "DELETE", path: "/users/:id", role: "delete", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("delete");
    expect(content).toContain("store.remove");
  });

  it("handles entity with custom id field name", async () => {
    const entity = makeEntity({
      fields: [
        { name: "userId", snakeName: "user_id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toBeTruthy();
  });

  it("handles tree role", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "parentId", snakeName: "parent_id", type: "string", zodType: "z.string()", required: false, nullable: true },
      ],
      operations: [
        { name: "tree", method: "GET", path: "/users/tree", role: "tree", hasInput: false, queryParams: [] },
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("buildEmbeddedTree");
  });

  it("handles subtree role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "subtree", method: "GET", path: "/users/tree/:id", role: "subtree", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("get");
    expect(content).toContain("store.getById");
  });

  it("handles order role combined with list", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
        { name: "displayOrder", snakeName: "display_order", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        { name: "order", method: "PATCH", path: "/users/order", role: "order", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("patch");
    expect(content).toContain("store.update");
  });

  it("handles create with void response (DELETE-like POST)", async () => {
    const entity = makeEntity({
      operations: [
        { name: "create", method: "POST", path: "/users", role: "create", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("post");
    expect(content).toContain("store.create");
  });

  it("handles entity with non-id path param (field-based lookup)", async () => {
    const entity = makeEntity({
      operations: [
        { name: "get", method: "GET", path: "/users/:username", role: "get", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("username");
    expect(content).toContain("store.filter");
  });

  it("handles unknown role combined with list", async () => {
    const entity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        { name: "custom", method: "POST", path: "/users/custom", role: "customAction" as never, hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("HttpResponse.json");
  });

  it("deduplicates operations by method:path", async () => {
    const entity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        { name: "list2", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    // Should have only one GET handler for /users
    const matches = content.match(/http\.get/g);
    expect(matches).toHaveLength(1);
  });
});
