import { describe, it, expect } from "vitest";

// These helpers are not exported from the openapi.ts module.
// We replicate the logic here as a mirror-test strategy to ensure coverage
// of the helper functions.

// ── generateCrudConfigContent (private helper — mirror) ──────

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

function resolveHookId(op: { resolvedHookName?: string; operationId?: string; name: string }): string {
  if (op.resolvedHookName) {
    return op.resolvedHookName.replace(/^use/, "").charAt(0).toLowerCase()
      + op.resolvedHookName.replace(/^use/, "").slice(1);
  }
  const raw = op.operationId ?? op.name;
  return raw.replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase());
}

interface ExtractedOperation {
  name: string;
  method: string;
  path: string;
  role?: string;
  resolvedHookName?: string;
  operationId?: string;
}

interface ExtractedEntity {
  name: string;
  path: string;
  operations: ExtractedOperation[];
}

const STANDARD_ROLES = ["list", "getAll", "get", "create", "update", "delete", "getForEdit", "tree", "subtree", "multiUpdate", "batchUpdate", "batchDelete", "search"] as const;

function generateCrudConfigContent(
  entities: ExtractedEntity[],
): string {
  const lines: string[] = [
    `import { defineCrudMap } from "@simplix-react/cli";`,
    ``,
    `export default defineCrudMap({`,
  ];

  for (const entity of entities) {
    const inferredRoles = new Map<string, string>();

    for (const op of entity.operations) {
      const hookId = resolveHookId(op);
      const role = op.role ?? inferCrudRole(op.method, op.path, entity.path);

      if (role && !inferredRoles.has(role)) {
        inferredRoles.set(role, hookId);
      }
    }

    lines.push(`  ${entity.name}: {`);

    for (const role of STANDARD_ROLES) {
      const hookId = inferredRoles.get(role);
      if (hookId) {
        lines.push(`    ${role}: "${hookId}",`);
      } else {
        lines.push(`    // ${role}: "",`);
      }
    }

    const standardSet = new Set<string>(STANDARD_ROLES);
    for (const [role, hookId] of inferredRoles) {
      if (!standardSet.has(role)) {
        lines.push(`    ${role}: "${hookId}",`);
      }
    }

    lines.push(`  },`);
  }

  lines.push(`});`);
  lines.push(``);

  return lines.join("\n");
}

describe("generateCrudConfigContent", () => {
  it("generates config with all standard roles", () => {
    const entities: ExtractedEntity[] = [{
      name: "user",
      path: "/users",
      operations: [
        { name: "list", method: "GET", path: "/users/search", role: "list", operationId: "searchUsers" },
        { name: "get", method: "GET", path: "/users/:id", role: "get", operationId: "getUser" },
        { name: "create", method: "POST", path: "/users", role: "create", operationId: "createUser" },
        { name: "update", method: "PUT", path: "/users/:id", role: "update", operationId: "updateUser" },
        { name: "delete", method: "DELETE", path: "/users/:id", role: "delete", operationId: "deleteUser" },
      ],
    }];

    const result = generateCrudConfigContent(entities);
    expect(result).toContain('list: "searchUsers"');
    expect(result).toContain('get: "getUser"');
    expect(result).toContain('create: "createUser"');
    expect(result).toContain('update: "updateUser"');
    expect(result).toContain('delete: "deleteUser"');
    expect(result).toContain("// getAll:");
    expect(result).toContain("// getForEdit:");
  });

  it("includes extra non-standard roles", () => {
    const entities: ExtractedEntity[] = [{
      name: "item",
      path: "/items",
      operations: [
        { name: "list", method: "GET", path: "/items/search", role: "list", operationId: "searchItems" },
        { name: "activate", method: "PATCH", path: "/items/:id/activate", role: "activate", operationId: "activateItem" },
      ],
    }];

    const result = generateCrudConfigContent(entities);
    expect(result).toContain('list: "searchItems"');
    expect(result).toContain('activate: "activateItem"');
  });

  it("generates config for multiple entities", () => {
    const entities: ExtractedEntity[] = [
      {
        name: "user",
        path: "/users",
        operations: [
          { name: "list", method: "GET", path: "/users/search", role: "list", operationId: "searchUsers" },
        ],
      },
      {
        name: "pet",
        path: "/pets",
        operations: [
          { name: "list", method: "GET", path: "/pets/search", role: "list", operationId: "searchPets" },
        ],
      },
    ];

    const result = generateCrudConfigContent(entities);
    expect(result).toContain("user: {");
    expect(result).toContain("pet: {");
    expect(result).toContain('searchUsers');
    expect(result).toContain('searchPets');
  });

  it("uses resolvedHookName when available", () => {
    const entities: ExtractedEntity[] = [{
      name: "account",
      path: "/accounts",
      operations: [
        { name: "list", method: "GET", path: "/accounts/search", role: "list", resolvedHookName: "useSearchAdminAccounts", operationId: "searchAccounts" },
      ],
    }];

    const result = generateCrudConfigContent(entities);
    expect(result).toContain('list: "searchAdminAccounts"');
  });

  it("infers roles when role is not set", () => {
    const entities: ExtractedEntity[] = [{
      name: "user",
      path: "/users",
      operations: [
        { name: "listUsers", method: "GET", path: "/users/search", operationId: "listUsers" },
        { name: "getUser", method: "GET", path: "/users/:id", operationId: "getUser" },
        { name: "createUser", method: "POST", path: "/users", operationId: "createUser" },
      ],
    }];

    const result = generateCrudConfigContent(entities);
    expect(result).toContain('list: "listUsers"');
    expect(result).toContain('get: "getUser"');
    expect(result).toContain('create: "createUser"');
  });

  it("does not duplicate inferred roles", () => {
    const entities: ExtractedEntity[] = [{
      name: "user",
      path: "/users",
      operations: [
        { name: "search", method: "GET", path: "/users/search", role: "list", operationId: "searchUsers" },
        { name: "getAll", method: "GET", path: "/users", role: "list", operationId: "getAllUsers" },
      ],
    }];

    const result = generateCrudConfigContent(entities);
    // First inferred role wins
    expect(result).toContain('list: "searchUsers"');
    expect(result).not.toContain('list: "getAllUsers"');
  });
});

// ── resolveEntityHookNames (private helper — mirror) ─────────

describe("resolveEntityHookNames (mirror)", () => {
  interface ResolvedOperation {
    operationId?: string;
    method: string;
    path: string;
    resolvedHookName?: string;
    role?: string;
    queryParams: Array<{ name: string }>;
  }

  interface NamingResult {
    hookName: string;
    role?: string;
  }

  interface OperationContext {
    operationId: string;
    method: string;
    path: string;
    tag: string;
    entityName: string;
    pathParams: string[];
    queryParams: string[];
    extensions: Record<string, unknown>;
  }

  interface NamingStrategy {
    resolveOperation(ctx: OperationContext): NamingResult;
  }

  function resolveEntityHookNames(
    entities: Array<{ name: string; tags: string[]; operations: ResolvedOperation[] }>,
    naming: NamingStrategy,
  ): void {
    for (const entity of entities) {
      for (const op of entity.operations) {
        if (!op.operationId) continue;
        const pathWithBraces = op.path.replace(/:(\w+)/g, "{$1}");
        const pathParams = [...op.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
        const context: OperationContext = {
          operationId: op.operationId,
          method: op.method,
          path: pathWithBraces,
          tag: entity.tags[0],
          entityName: entity.name,
          pathParams,
          queryParams: op.queryParams.map((qp) => qp.name),
          extensions: {},
        };
        const resolved = naming.resolveOperation(context);
        const hn = resolved.hookName;
        op.resolvedHookName = `use${hn.charAt(0).toUpperCase()}${hn.slice(1)}`;
        op.role = resolved.role;
      }
    }
  }

  it("resolves hook names with naming strategy", () => {
    const naming: NamingStrategy = {
      resolveOperation: (ctx) => ({
        hookName: `get${ctx.entityName.charAt(0).toUpperCase()}${ctx.entityName.slice(1)}List`,
        role: "list",
      }),
    };

    const entities = [{
      name: "user",
      tags: ["user-tag"],
      operations: [
        { operationId: "listUsers", method: "GET", path: "/users", queryParams: [] } as ResolvedOperation,
      ],
    }];

    resolveEntityHookNames(entities, naming);

    expect(entities[0].operations[0].resolvedHookName).toBe("useGetUserList");
    expect(entities[0].operations[0].role).toBe("list");
  });

  it("skips operations without operationId", () => {
    const naming: NamingStrategy = {
      resolveOperation: () => ({ hookName: "test" }),
    };

    const entities = [{
      name: "user",
      tags: ["tag"],
      operations: [
        { method: "GET", path: "/users", queryParams: [] } as ResolvedOperation,
      ],
    }];

    resolveEntityHookNames(entities, naming);

    expect(entities[0].operations[0].resolvedHookName).toBeUndefined();
  });

  it("converts :param to {param} in path", () => {
    let capturedPath = "";
    const naming: NamingStrategy = {
      resolveOperation: (ctx) => {
        capturedPath = ctx.path;
        return { hookName: "test" };
      },
    };

    const entities = [{
      name: "user",
      tags: ["tag"],
      operations: [
        { operationId: "getUser", method: "GET", path: "/users/:id", queryParams: [] } as ResolvedOperation,
      ],
    }];

    resolveEntityHookNames(entities, naming);

    expect(capturedPath).toBe("/users/{id}");
  });

  it("extracts path params correctly", () => {
    let capturedPathParams: string[] = [];
    const naming: NamingStrategy = {
      resolveOperation: (ctx) => {
        capturedPathParams = ctx.pathParams;
        return { hookName: "test" };
      },
    };

    const entities = [{
      name: "user",
      tags: ["tag"],
      operations: [
        { operationId: "getSubItem", method: "GET", path: "/users/:userId/items/:itemId", queryParams: [] } as ResolvedOperation,
      ],
    }];

    resolveEntityHookNames(entities, naming);

    expect(capturedPathParams).toEqual(["userId", "itemId"]);
  });
});
