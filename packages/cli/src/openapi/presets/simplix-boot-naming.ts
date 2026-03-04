import type {
  OpenApiNamingStrategy,
  EntityNameContext,
  OperationContext,
  ResolvedOperation,
} from "../naming-strategy.js";
import { toCamelCase } from "../../utils/case.js";

/**
 * NamingStrategy for simplix-boot style OpenAPI specs.
 *
 * Handles Boot conventions:
 * - Tag format: "scope.crud.EntityName" → camelCase entity name
 * - Auto-generated operationIds with numeric suffixes (get_16, create_16)
 * - CRUD path patterns: /search, /create, /{id}, /{id}/edit, /batch, etc.
 */
export const simplixBootNaming: OpenApiNamingStrategy = {
  resolveEntityName(context: EntityNameContext): string {
    if (!context.tag) return "";

    // Boot tag convention: "scope.crud.EntityName" or "scope.EntityName"
    const segments = context.tag.split(".");
    const entitySegment = segments[segments.length - 1];

    // PascalCase → camelCase
    return entitySegment.charAt(0).toLowerCase() + entitySegment.slice(1);
  },

  resolveOperation(context: OperationContext): ResolvedOperation {
    const entity = context.entityName;
    const pascal = entity.charAt(0).toUpperCase() + entity.slice(1);
    const method = context.method.toUpperCase();
    const path = context.path;
    const hasPathParam = context.pathParams.length > 0;

    // Extract the path suffix after the entity base path for pattern matching
    const lastParamIdx = path.lastIndexOf("/{");
    const pathAfterParam = lastParamIdx >= 0
      ? path.slice(path.indexOf("}", lastParamIdx) + 1)
      : "";
    const pathSegments = path.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // --- GET patterns ---
    if (method === "GET") {
      if (lastSegment === "search") {
        return { role: "list", hookName: `list${pascal}s` };
      }
      if (pathAfterParam === "/edit") {
        return { role: "getForEdit", hookName: `get${pascal}ForEdit` };
      }
      // Tree pattern: /entity/tree or /entity/tree/{id}
      if (pathSegments.includes("tree")) {
        if (hasPathParam) {
          return { role: "subtree", hookName: `get${pascal}Subtree` };
        }
        return { role: "tree", hookName: `get${pascal}Tree` };
      }
      if (hasPathParam && !pathAfterParam) {
        return { role: "get", hookName: `get${pascal}` };
      }
      return { role: "list", hookName: `list${pascal}s` };
    }

    // --- POST patterns ---
    if (method === "POST") {
      if (lastSegment === "create") {
        return { role: "create", hookName: `create${pascal}` };
      }
      if (lastSegment === "search") {
        return { role: "search", hookName: `search${pascal}s` };
      }
      return { role: "create", hookName: `create${pascal}` };
    }

    // --- PUT patterns ---
    if (method === "PUT") {
      return { role: "update", hookName: `update${pascal}` };
    }

    // --- DELETE patterns ---
    if (method === "DELETE") {
      if (lastSegment === "batch") {
        return { role: "batchDelete", hookName: `batchDelete${pascal}s` };
      }
      return { role: "delete", hookName: `delete${pascal}` };
    }

    // --- PATCH patterns ---
    if (method === "PATCH") {
      if (lastSegment === "batch") {
        return { role: "batchUpdate", hookName: `batchUpdate${pascal}s` };
      }
      // PATCH with suffix after entity or param → custom action
      // e.g. /floor/order, /floor/{id}/password
      const entitySegment = entity.toLowerCase();
      const isEntityOrParam = lastSegment === entitySegment || lastSegment.startsWith("{");
      if (!isEntityOrParam) {
        const actionSuffix = toCamelCase(lastSegment);
        return {
          role: actionSuffix,
          hookName: `${actionSuffix}${pascal}`,
        };
      }
      // PATCH /entity (no param) → multiUpdate
      if (!hasPathParam) {
        return { role: "multiUpdate", hookName: `multiUpdate${pascal}s` };
      }
      return { role: "update", hookName: `update${pascal}` };
    }

    // Fallback
    return { role: context.operationId, hookName: context.operationId };
  },
};
