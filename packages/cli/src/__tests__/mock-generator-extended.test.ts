import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateMockFiles } from "../openapi/generation/mock-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "mock-gen-ext-test-"));
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

describe("generateMockFiles extended", () => {
  it("generates mock entry with multiple entities", async () => {
    const userEntity = makeEntity();
    const petEntity = makeEntity({
      name: "pet",
      pascalName: "Pet",
      pluralName: "pets",
      path: "/pets",
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/pets", role: "list", hasInput: false, queryParams: [] },
        { name: "get", method: "GET", path: "/pets/:petId", role: "get", hasInput: false, queryParams: [] },
        { name: "create", method: "POST", path: "/pets", role: "create", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "multi", [userEntity, petEntity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("createUserHandlers");
    expect(handlersContent).toContain("createPetHandlers");

    const entryContent = await readFile(join(tempDir, "src/mock/index.ts"), "utf-8");
    expect(entryContent).toContain("createMultiMock");
    expect(entryContent).toContain("userStore");
    expect(entryContent).toContain("petStore");
    expect(entryContent).toContain("userSeeds");
    expect(entryContent).toContain("petSeeds");
  });

  it("uses modelType for type imports when available", async () => {
    const entity = makeEntity({
      modelType: "UserAccount",
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("UserAccount");
  });

  it("handles update without path param (body-based PUT)", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "PUT", path: "/users", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("body.id");
    expect(handlersContent).toContain("store.update");
  });

  it("handles delete without path param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "delete", method: "DELETE", path: "/users", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("delete");
  });

  it("handles update by non-id field param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "PATCH", path: "/users/:username", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("username");
    expect(handlersContent).toContain("store.filter");
  });

  it("handles delete by non-id field param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "delete", method: "DELETE", path: "/users/:username", role: "delete", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("username");
    expect(handlersContent).toContain("store.filter");
    expect(handlersContent).toContain("store.remove");
  });

  it("infers roles from method/path when role is not set", async () => {
    const entity = makeEntity({
      operations: [
        // No role set — should be inferred from method+path
        { name: "listUsers", method: "GET", path: "/users", hasInput: false, queryParams: [] },
        { name: "getUser", method: "GET", path: "/users/:id", hasInput: false, queryParams: [] },
        { name: "createUser", method: "POST", path: "/users", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("listPaged"); // list inferred
    expect(handlersContent).toContain("getById"); // get inferred
    expect(handlersContent).toContain("store.create"); // create inferred
  });

  it("handles batchUpdate role", async () => {
    const entity = makeEntity({
      operations: [
        { name: "batchUpdate", method: "PATCH", path: "/users/batch", role: "batchUpdate", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("patch");
    expect(handlersContent).toContain("store.update");
  });

  it("handles operation with no role and no store (empty body)", async () => {
    // Entity with no fields = no store, so storeEntities is empty
    // But there are still operations, so handlers.ts is generated (imports only)
    const entity = makeEntity({
      fields: [],
      operations: [
        { name: "custom", method: "POST", path: "/users/custom", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    // handlers.ts is still generated with MSW imports even without store entities
    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("import { http, HttpResponse }");
  });

  it("handles entity with tree and custom parentIdField", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "parentCategoryId", snakeName: "parent_category_id", type: "string", zodType: "z.string()", required: false, nullable: true },
      ],
      operations: [
        { name: "tree", method: "GET", path: "/users/tree", role: "tree", hasInput: false, queryParams: [] },
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("buildEmbeddedTree");
    expect(handlersContent).toContain("parentCategoryId");
  });

  it("handles entity with custom non-id primary key", async () => {
    const entity = makeEntity({
      fields: [
        { name: "code", snakeName: "code", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/items", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    // Should still generate
    const entryContent = await readFile(join(tempDir, "src/mock/index.ts"), "utf-8");
    expect(entryContent).toContain("createTestMock");
  });

  it("handles order role with body schema items", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "displayOrder", snakeName: "display_order", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        {
          name: "order",
          method: "PATCH",
          path: "/users/order",
          role: "order",
          hasInput: true,
          bodySchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                sortOrder: { type: "integer" },
              },
            },
          },
          queryParams: [],
        },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("sortOrder");
  });

  it("handles getForEdit with non-id parent param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "getForEdit", method: "GET", path: "/users/:username/edit", role: "getForEdit", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    expect(handlersContent).toContain("username");
    expect(handlersContent).toContain("store.filter");
  });

  it("handles query param with dot in name (sanitized)", async () => {
    const entity = makeEntity({
      operations: [
        {
          name: "list",
          method: "GET",
          path: "/users",
          role: "list",
          hasInput: false,
          queryParams: [{ name: "status.in", type: "string", required: false }],
        },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersContent = await readFile(join(tempDir, "src/generated/mock/handlers.ts"), "utf-8");
    // Variable name should be sanitized
    expect(handlersContent).toContain("status_in");
    // Field name lookup should use the part before the dot
    expect(handlersContent).toContain("item.status");
  });
});
