import { describe, it, expect } from "vitest";
import { computeDiff, formatDiff } from "../openapi/adaptation/diff-engine.js";
import type { ExtractedEntity, OpenAPISnapshot, DiffResult } from "../openapi/types.js";

function makeEntity(overrides: Partial<ExtractedEntity> = {}): ExtractedEntity {
  return {
    name: "user",
    pascalName: "User",
    pluralName: "users",
    path: "/users",
    fields: [],
    queryParams: [],
    operations: [],
    tags: [],
    ...overrides,
  };
}

// ── computeDiff ─────────────────────────────────────────────

describe("computeDiff", () => {
  it("detects added entities", () => {
    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [],
    };
    const current = [makeEntity()];

    const diff = computeDiff(previous, current);
    expect(diff.hasChanges).toBe(true);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe("user");
  });

  it("detects removed entities", () => {
    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [makeEntity()],
    };

    const diff = computeDiff(previous, []);
    expect(diff.hasChanges).toBe(true);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe("user");
  });

  it("detects modified entity with added fields", () => {
    const prevEntity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });
    const currEntity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "email", snakeName: "email", type: "string", zodType: "z.string().email()", required: true, nullable: false },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    expect(diff.hasChanges).toBe(true);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].addedFields).toHaveLength(1);
    expect(diff.modified[0].addedFields[0].name).toBe("email");
  });

  it("detects modified entity with removed fields", () => {
    const prevEntity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "email", snakeName: "email", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });
    const currEntity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    expect(diff.hasChanges).toBe(true);
    expect(diff.modified[0].removedFields).toContain("email");
  });

  it("detects changed field type (zodType)", () => {
    const prevEntity = makeEntity({
      fields: [
        { name: "age", snakeName: "age", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });
    const currEntity = makeEntity({
      fields: [
        { name: "age", snakeName: "age", type: "number", zodType: "z.number()", required: true, nullable: false },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    expect(diff.modified[0].changedFields).toHaveLength(1);
    expect(diff.modified[0].changedFields[0].field).toBe("zodType");
    expect(diff.modified[0].changedFields[0].from).toBe("z.string()");
    expect(diff.modified[0].changedFields[0].to).toBe("z.number()");
  });

  it("detects changed field required/nullable", () => {
    const prevEntity = makeEntity({
      fields: [
        { name: "email", snakeName: "email", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    });
    const currEntity = makeEntity({
      fields: [
        { name: "email", snakeName: "email", type: "string", zodType: "z.string()", required: false, nullable: true },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    const changes = diff.modified[0].changedFields;
    expect(changes.some((c) => c.field === "required")).toBe(true);
    expect(changes.some((c) => c.field === "nullable")).toBe(true);
  });

  it("detects added operations", () => {
    const prevEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
      ],
    });
    const currEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
        { name: "create", method: "POST", path: "/users", hasInput: true, queryParams: [] },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    expect(diff.modified[0].addedOperations).toContain("create");
  });

  it("detects removed operations", () => {
    const prevEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
        { name: "delete", method: "DELETE", path: "/users/:id", hasInput: false, queryParams: [] },
      ],
    });
    const currEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    expect(diff.modified[0].removedOperations).toContain("delete");
  });

  it("detects changed operation method", () => {
    const prevEntity = makeEntity({
      operations: [
        { name: "update", method: "PUT", path: "/users/:id", hasInput: true, queryParams: [] },
      ],
    });
    const currEntity = makeEntity({
      operations: [
        { name: "update", method: "PATCH", path: "/users/:id", hasInput: true, queryParams: [] },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    const opChange = diff.modified[0].changedOperations.find(
      (c) => c.field === "method",
    );
    expect(opChange).toBeDefined();
    expect(opChange!.from).toBe("PUT");
    expect(opChange!.to).toBe("PATCH");
  });

  it("detects changed operation path", () => {
    const prevEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users/search", hasInput: false, queryParams: [] },
      ],
    });
    const currEntity = makeEntity({
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [prevEntity],
    };

    const diff = computeDiff(previous, [currEntity]);
    const opChange = diff.modified[0].changedOperations.find(
      (c) => c.field === "path",
    );
    expect(opChange).toBeDefined();
  });

  it("returns hasChanges=false when entities are identical", () => {
    const entity = makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
      operations: [
        { name: "list", method: "GET", path: "/users", hasInput: false, queryParams: [] },
      ],
    });

    const previous: OpenAPISnapshot = {
      generatedAt: "2024-01-01",
      specSource: "api.json",
      entities: [entity],
    };

    const diff = computeDiff(previous, [entity]);
    expect(diff.hasChanges).toBe(false);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });
});

// ── formatDiff ──────────────────────────────────────────────

describe("formatDiff", () => {
  it("formats added entities", () => {
    const diff: DiffResult = {
      added: [makeEntity({ fields: [{ name: "id", snakeName: "id", type: "string", zodType: "", required: true, nullable: false }] })],
      removed: [],
      modified: [],
      hasChanges: true,
    };

    const output = formatDiff(diff);
    expect(output).toContain("Added entities");
    expect(output).toContain("user");
    expect(output).toContain("1 fields");
  });

  it("formats removed entities", () => {
    const diff: DiffResult = {
      added: [],
      removed: [makeEntity()],
      modified: [],
      hasChanges: true,
    };

    const output = formatDiff(diff);
    expect(output).toContain("Removed entities");
    expect(output).toContain("user");
  });

  it("formats modified entities with all change types", () => {
    const diff: DiffResult = {
      added: [],
      removed: [],
      modified: [
        {
          entityName: "user",
          addedFields: [{ name: "email", snakeName: "email", type: "string", zodType: "", required: true, nullable: false }],
          removedFields: ["legacy"],
          changedFields: [{ name: "age", field: "zodType", from: "z.string()", to: "z.number()" }],
          addedOperations: ["create"],
          removedOperations: ["search"],
          changedOperations: [{ name: "update", field: "method", from: "PUT", to: "PATCH" }],
        },
      ],
      hasChanges: true,
    };

    const output = formatDiff(diff);
    expect(output).toContain("Modified entities");
    expect(output).toContain("user");
    expect(output).toContain("email");
    expect(output).toContain("legacy");
    expect(output).toContain("age");
    expect(output).toContain("operation: create");
    expect(output).toContain("operation: search");
    expect(output).toContain("operation update.method");
  });

  it("formats no changes message", () => {
    const diff: DiffResult = {
      added: [],
      removed: [],
      modified: [],
      hasChanges: false,
    };

    const output = formatDiff(diff);
    expect(output).toContain("No changes detected");
  });

  it("includes total change count in header", () => {
    const diff: DiffResult = {
      added: [makeEntity()],
      removed: [makeEntity({ name: "pet", pascalName: "Pet" })],
      modified: [],
      hasChanges: true,
    };

    const output = formatDiff(diff);
    expect(output).toContain("2 change(s)");
  });
});
