import { describe, it, expect } from "vitest";
import type {
  OpenApiNamingStrategy,
  OperationContext,
  EntityNameContext,
  ResolvedOperation,
} from "../openapi/naming/naming-strategy.js";

// The naming strategy module only exports interfaces/types.
// We test the interface contract by implementing it.

describe("OpenApiNamingStrategy interface", () => {
  it("can be implemented and used", () => {
    const strategy: OpenApiNamingStrategy = {
      resolveEntityName(context: EntityNameContext): string {
        return context.tag?.toLowerCase() ?? "unknown";
      },
      resolveOperation(context: OperationContext): ResolvedOperation {
        const role = context.method === "GET" ? "get" : "create";
        return {
          role,
          hookName: context.operationId,
        };
      },
    };

    const entityName = strategy.resolveEntityName({
      tag: "Users",
      paths: ["/users"],
      operations: [],
      schemaNames: [],
      extensions: {},
    });
    expect(entityName).toBe("users");

    const resolved = strategy.resolveOperation({
      operationId: "getUser",
      method: "GET",
      path: "/users/{id}",
      entityName: "user",
      pathParams: ["id"],
      queryParams: [],
      extensions: {},
    });
    expect(resolved.role).toBe("get");
    expect(resolved.hookName).toBe("getUser");
  });
});
