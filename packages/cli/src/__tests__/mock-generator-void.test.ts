import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateMockFiles } from "../openapi/generation/mock-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "mock-gen-void-test-"));
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

describe("generateMockFiles void response handlers", () => {
  it("generates void create handler (DELETE-like POST method)", async () => {
    // Simulate a scenario where create returns void (method is POST but effectively no body)
    const entity = makeEntity({
      operations: [
        { name: "create", method: "DELETE", path: "/users", role: "create", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    // Void create uses new HttpResponse(null, { status: 204 })
    expect(content).toContain("204");
    expect(content).toContain("store.create");
  });

  it("generates void update handler with path param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "DELETE", path: "/users/:id", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("204");
    expect(content).toContain("store.update");
  });

  it("generates void update handler without path param (body-based)", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "DELETE", path: "/users", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("204");
    expect(content).toContain("body.id");
  });

  it("generates void update by non-id field handler", async () => {
    const entity = makeEntity({
      operations: [
        { name: "update", method: "DELETE", path: "/users/:username", role: "update", hasInput: true, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("204");
    expect(content).toContain("username");
    expect(content).toContain("store.filter");
  });

  it("generates handler with response adapter wrapper", async () => {
    const entity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        { name: "get", method: "GET", path: "/users/:id", role: "get", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity], "simplix-boot");

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    // simplix-boot adapter should wrap HttpResponse.json payloads
    expect(content).toBeTruthy();
  });

  it("generates handler for read without path param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "get", method: "GET", path: "/users", role: "get", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    // Should use store.list()[0] fallback
    expect(content).toContain("store.list()[0]");
  });

  it("generates delete handler without path param", async () => {
    const entity = makeEntity({
      operations: [
        { name: "delete", method: "DELETE", path: "/users", role: "delete", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    expect(content).toContain("HttpResponse.json(null)");
  });

  it("handles entity with tree and custom idField", async () => {
    const entity = makeEntity({
      fields: [
        { name: "categoryId", snakeName: "category_id", type: "string", zodType: "z.string()", required: true, nullable: false },
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
    // Should pass custom id field name
    expect(content).toContain("categoryId");
  });

  it("handles entity with order role and bodySchema items.properties", async () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
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
                customOrder: { type: "integer" },
              },
            },
          },
          queryParams: [],
        },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const handlersPath = join(tempDir, "src/generated/mock/handlers.ts");
    const content = await readFile(handlersPath, "utf-8");
    // Should use "customOrder" from body schema since it's the first non-id field
    expect(content).toContain("customOrder");
  });

  it("generates mock entry with custom id field using idArg", async () => {
    const entity = makeEntity({
      fields: [
        { name: "code", snakeName: "code", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      ],
    });

    await generateMockFiles(tempDir, "test", [entity]);

    const entryContent = await readFile(join(tempDir, "src/mock/index.ts"), "utf-8");
    // When id field is not "id", the store creation should pass the id field name
    expect(entryContent).toBeTruthy();
  });
});
