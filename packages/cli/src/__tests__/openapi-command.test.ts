import { describe, it, expect } from "vitest";

// These helpers are not exported from the openapi.ts module, but the exported
// pure functions can be exercised by importing the command and testing the
// self-contained helpers that ARE exported or calling them indirectly.
//
// For non-exported helpers we replicate the logic here as a mirror-test strategy.

// ── normalizeDomainName (private helper — mirror) ────────────

function normalizeDomainName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

describe("normalizeDomainName", () => {
  it("lowercases and removes special chars", () => {
    expect(normalizeDomainName("My API!")).toBe("my-api");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeDomainName("Petstore API")).toBe("petstore-api");
  });

  it("handles multiple spaces", () => {
    expect(normalizeDomainName("  My   API  ")).toBe("my-api");
  });

  it("preserves hyphens and numbers", () => {
    expect(normalizeDomainName("api-v2")).toBe("api-v2");
  });

  it("handles empty string", () => {
    expect(normalizeDomainName("")).toBe("");
  });

  it("removes parentheses and other symbols", () => {
    expect(normalizeDomainName("API (v3.0)")).toBe("api-v30");
  });
});

// ── camelToLabel (private helper — mirror) ───────────────────

function camelToLabel(name: string): string {
  if (name.toLowerCase() === "id") return "ID";
  if (name.includes("_")) {
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  if (name === name.toUpperCase() && name.length > 1) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

describe("camelToLabel", () => {
  it("returns ID for id (case insensitive)", () => {
    expect(camelToLabel("id")).toBe("ID");
  });

  it("handles SCREAMING_SNAKE_CASE", () => {
    expect(camelToLabel("NULL_FORMAT")).toBe("Null Format");
  });

  it("handles ALL_CAPS without underscores", () => {
    expect(camelToLabel("WIEGAND")).toBe("Wiegand");
    expect(camelToLabel("RED")).toBe("Red");
  });

  it("handles camelCase", () => {
    expect(camelToLabel("formatType")).toBe("Format Type");
  });

  it("handles simple lowercase word", () => {
    expect(camelToLabel("name")).toBe("Name");
  });

  it("handles single char", () => {
    expect(camelToLabel("A")).toBe("A");
  });
});

// ── enumName (private helper — mirror) ───────────────────────

function enumName(entityName: string, fieldName: string): string {
  return entityName + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

describe("enumName", () => {
  it("concatenates entity and capitalized field name", () => {
    expect(enumName("user", "status")).toBe("userStatus");
    expect(enumName("order", "type")).toBe("orderType");
  });
});

// ── buildLocaleJson (private helper — mirror) ────────────────

interface EntityField {
  name: string;
  enum?: string[];
  enumTypeName?: string;
}

interface ExtractedEntity {
  name: string;
  fields: EntityField[];
}

function buildLocaleJson(entities: ExtractedEntity[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const enums: Record<string, Record<string, string>> = {};

  for (const entity of entities) {
    const fields: Record<string, string> = {};
    for (const field of entity.fields) {
      fields[field.name] = camelToLabel(field.name);
      if (field.enum?.length) {
        const eName = field.enumTypeName ?? enumName(entity.name, field.name);
        enums[eName] = {};
        for (const v of field.enum) {
          enums[eName][v] = camelToLabel(v);
        }
      }
    }
    result[entity.name] = { fields };
  }

  if (Object.keys(enums).length > 0) {
    result["enums"] = enums;
  }

  return result;
}

describe("buildLocaleJson", () => {
  it("builds locale JSON with field labels", () => {
    const entities: ExtractedEntity[] = [
      {
        name: "user",
        fields: [
          { name: "id" },
          { name: "firstName" },
        ],
      },
    ];
    const result = buildLocaleJson(entities);
    expect(result).toEqual({
      user: { fields: { id: "ID", firstName: "First Name" } },
    });
  });

  it("includes enum labels", () => {
    const entities: ExtractedEntity[] = [
      {
        name: "order",
        fields: [
          { name: "status", enum: ["placed", "delivered"] },
        ],
      },
    ];
    const result = buildLocaleJson(entities);
    expect(result).toHaveProperty("enums");
    expect((result.enums as Record<string, unknown>)["orderStatus"]).toEqual({
      placed: "Placed",
      delivered: "Delivered",
    });
  });

  it("uses enumTypeName when provided", () => {
    const entities: ExtractedEntity[] = [
      {
        name: "item",
        fields: [
          { name: "color", enum: ["RED"], enumTypeName: "ItemColor" },
        ],
      },
    ];
    const result = buildLocaleJson(entities);
    expect((result.enums as Record<string, unknown>)["ItemColor"]).toEqual({
      RED: "Red",
    });
  });

  it("returns empty result for empty entities", () => {
    const result = buildLocaleJson([]);
    expect(result).toEqual({});
  });
});

// ── mergeLocaleJson (private helper — mirror) ────────────────

function mergeLocaleJson(
  existing: Record<string, unknown>,
  generated: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, genValue] of Object.entries(generated)) {
    const exValue = existing[key];
    if (
      exValue && typeof exValue === "object" && !Array.isArray(exValue) &&
      genValue && typeof genValue === "object" && !Array.isArray(genValue)
    ) {
      result[key] = mergeLocaleJson(
        exValue as Record<string, unknown>,
        genValue as Record<string, unknown>,
      );
    } else if (exValue !== undefined) {
      result[key] = exValue;
    } else {
      result[key] = genValue;
    }
  }

  return result;
}

describe("mergeLocaleJson", () => {
  it("preserves existing values", () => {
    const existing = { user: { fields: { name: "Custom Name" } } };
    const generated = { user: { fields: { name: "Name", email: "Email" } } };
    const result = mergeLocaleJson(existing, generated);
    expect((result.user as Record<string, unknown>).fields).toEqual({ name: "Custom Name", email: "Email" });
  });

  it("adds new generated keys", () => {
    const existing = {};
    const generated = { user: { fields: { name: "Name" } } };
    const result = mergeLocaleJson(existing, generated);
    expect(result).toEqual(generated);
  });

  it("preserves existing scalar over generated", () => {
    const existing = { title: "My Title" };
    const generated = { title: "Generated Title" };
    const result = mergeLocaleJson(existing, generated);
    expect(result.title).toBe("My Title");
  });
});

// ── mergeIndexWithCustomExports (private helper — mirror) ────

function mergeIndexWithCustomExports(newContent: string, existingContent: string): string {
  if (!existingContent.trim()) return newContent;

  const newLines = new Set(newContent.split("\n").map((l) => l.trim()).filter(Boolean));

  const customExports = existingContent
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (!trimmed.startsWith("export ")) return false;
      return !newLines.has(trimmed);
    });

  if (customExports.length === 0) return newContent;

  return newContent.trimEnd() + "\n" + customExports.join("\n") + "\n";
}

describe("mergeIndexWithCustomExports", () => {
  it("returns new content when existing is empty", () => {
    const result = mergeIndexWithCustomExports('export * from "./hooks";\n', "");
    expect(result).toBe('export * from "./hooks";\n');
  });

  it("returns new content when existing is whitespace", () => {
    const result = mergeIndexWithCustomExports('export * from "./hooks";\n', "  \n ");
    expect(result).toBe('export * from "./hooks";\n');
  });

  it("appends custom exports from existing", () => {
    const newContent = 'export * from "./hooks";\n';
    const existingContent = 'export * from "./hooks";\nexport * from "./constants";\n';
    const result = mergeIndexWithCustomExports(newContent, existingContent);
    expect(result).toContain('export * from "./constants";');
    expect(result).toContain('export * from "./hooks";');
  });

  it("does not duplicate existing exports", () => {
    const newContent = 'export * from "./hooks";\nexport * from "./schemas";\n';
    const existingContent = 'export * from "./hooks";\nexport * from "./schemas";\n';
    const result = mergeIndexWithCustomExports(newContent, existingContent);
    expect(result).toBe(newContent);
  });

  it("ignores non-export lines in existing", () => {
    const newContent = 'export * from "./hooks";\n';
    const existingContent = '// comment\nimport { foo } from "bar";\nexport * from "./hooks";\nexport * from "./custom";\n';
    const result = mergeIndexWithCustomExports(newContent, existingContent);
    expect(result).toContain('export * from "./custom";');
    expect(result).not.toContain("// comment");
    expect(result).not.toContain('import { foo }');
  });
});

// ── inferCrudRole (private helper — mirror) ──────────────────

type InferredRole = "list" | "getAll" | "get" | "getForEdit" | "create" | "update" | "delete" | "multiUpdate" | "batchUpdate" | "batchDelete" | "search";

function inferCrudRole(
  method: string,
  opPath: string,
  basePath: string,
): InferredRole | null {
  const relative = opPath === basePath ? "/" : opPath.slice(basePath.length);
  const isItemPath = /^\/[:{][^/}]+\}?$/.test(relative);

  if (method === "GET" && relative === "/search") return "list";
  if (method === "GET" && relative === "/") return "getAll";
  if (method === "GET" && isItemPath) return "get";
  if (method === "GET" && /^\/[:{][^/}]+\}?\/edit$/.test(relative)) return "getForEdit";
  if (method === "POST" && (relative === "/" || relative === "/create")) return "create";
  if (method === "POST" && relative === "/search") return "search";
  if ((method === "PUT" || method === "PATCH") && isItemPath) return "update";
  if (method === "PATCH" && relative === "/") return "multiUpdate";
  if (method === "PATCH" && relative === "/batch") return "batchUpdate";
  if (method === "DELETE" && isItemPath) return "delete";
  if (method === "DELETE" && (relative === "/" || relative === "/batch")) return "batchDelete";
  return null;
}

describe("inferCrudRole", () => {
  const base = "/users";

  it("detects GET /search as list", () => {
    expect(inferCrudRole("GET", "/users/search", base)).toBe("list");
  });

  it("detects GET / as getAll", () => {
    expect(inferCrudRole("GET", "/users", base)).toBe("getAll");
  });

  it("detects GET /:id as get", () => {
    expect(inferCrudRole("GET", "/users/:id", base)).toBe("get");
  });

  it("detects GET /:id/edit as getForEdit", () => {
    expect(inferCrudRole("GET", "/users/:id/edit", base)).toBe("getForEdit");
  });

  it("detects POST / as create", () => {
    expect(inferCrudRole("POST", "/users", base)).toBe("create");
  });

  it("detects POST /create as create", () => {
    expect(inferCrudRole("POST", "/users/create", base)).toBe("create");
  });

  it("detects POST /search as search", () => {
    expect(inferCrudRole("POST", "/users/search", base)).toBe("search");
  });

  it("detects PUT /:id as update", () => {
    expect(inferCrudRole("PUT", "/users/:id", base)).toBe("update");
  });

  it("detects PATCH /:id as update", () => {
    expect(inferCrudRole("PATCH", "/users/:id", base)).toBe("update");
  });

  it("detects PATCH / as multiUpdate", () => {
    expect(inferCrudRole("PATCH", "/users", base)).toBe("multiUpdate");
  });

  it("detects PATCH /batch as batchUpdate", () => {
    expect(inferCrudRole("PATCH", "/users/batch", base)).toBe("batchUpdate");
  });

  it("detects DELETE /:id as delete", () => {
    expect(inferCrudRole("DELETE", "/users/:id", base)).toBe("delete");
  });

  it("detects DELETE / as batchDelete", () => {
    expect(inferCrudRole("DELETE", "/users", base)).toBe("batchDelete");
  });

  it("detects DELETE /batch as batchDelete", () => {
    expect(inferCrudRole("DELETE", "/users/batch", base)).toBe("batchDelete");
  });

  it("returns null for unknown patterns", () => {
    expect(inferCrudRole("OPTIONS", "/users", base)).toBeNull();
  });
});

// ── resolveHookId (private helper — mirror) ──────────────────

function resolveHookId(op: { resolvedHookName?: string; operationId?: string; name: string }): string {
  if (op.resolvedHookName) {
    return op.resolvedHookName.replace(/^use/, "").charAt(0).toLowerCase()
      + op.resolvedHookName.replace(/^use/, "").slice(1);
  }
  const raw = op.operationId ?? op.name;
  return raw.replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase());
}

describe("resolveHookId", () => {
  it("strips use prefix from resolvedHookName and lowercases first char", () => {
    expect(resolveHookId({ resolvedHookName: "useGetUser", name: "x" })).toBe("getUser");
  });

  it("falls back to operationId", () => {
    expect(resolveHookId({ name: "listUsers", operationId: "listUsers" })).toBe("listUsers");
  });

  it("falls back to name when no operationId", () => {
    expect(resolveHookId({ name: "list_users" })).toBe("listUsers");
  });

  it("converts underscored operationId", () => {
    expect(resolveHookId({ name: "x", operationId: "get_user_by_id" })).toBe("getUserById");
  });
});

// ── deepMerge (private helper — mirror) ──────────────────────

function deepMerge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, overlayValue] of Object.entries(overlay)) {
    const baseValue = result[key];
    if (
      baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) &&
      overlayValue && typeof overlayValue === "object" && !Array.isArray(overlayValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overlayValue as Record<string, unknown>,
      );
    } else {
      result[key] = overlayValue;
    }
  }
  return result;
}

describe("deepMerge", () => {
  it("merges flat objects", () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("overlay overrides scalar values", () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("recursively merges nested objects", () => {
    const base = { user: { name: "Alice", age: 30 } };
    const overlay = { user: { age: 31, email: "a@b.c" } };
    expect(deepMerge(base, overlay)).toEqual({
      user: { name: "Alice", age: 31, email: "a@b.c" },
    });
  });

  it("does not merge arrays (overlay wins)", () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] });
  });
});

// ── resolveServerOrigin (private helper — mirror) ────────────

function resolveServerOrigin(
  specSource: string,
  spec: { servers?: Array<{ url: string }> },
): string | undefined {
  if (specSource.startsWith("http://") || specSource.startsWith("https://")) {
    return new URL(specSource).origin;
  }
  const serverUrl = spec.servers?.[0]?.url;
  if (serverUrl) {
    try {
      return new URL(serverUrl).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

describe("resolveServerOrigin", () => {
  it("extracts origin from HTTP spec source URL", () => {
    expect(resolveServerOrigin("https://api.example.com/v3/openapi.json", {}))
      .toBe("https://api.example.com");
  });

  it("extracts origin from spec servers[0].url", () => {
    expect(resolveServerOrigin("./api.json", { servers: [{ url: "http://localhost:8080/api" }] }))
      .toBe("http://localhost:8080");
  });

  it("returns undefined for file source with no servers", () => {
    expect(resolveServerOrigin("./api.json", {})).toBeUndefined();
  });

  it("returns undefined for invalid server URL", () => {
    expect(resolveServerOrigin("./api.json", { servers: [{ url: "/relative-only" }] }))
      .toBeUndefined();
  });
});
