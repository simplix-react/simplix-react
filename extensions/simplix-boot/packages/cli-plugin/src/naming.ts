import type {
  OpenApiNamingStrategy,
  EntityNameContext,
  OperationContext,
  ResolvedOperation,
} from "@simplix-react/cli";

function toCamelCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .split(/[-_\s]+/)
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

/**
 * Build a set of entity kebab-name prefixes for fuzzy path matching.
 * When the tag-derived entity name has a qualifier suffix (e.g., "PolicyOverview" → "policy-overview"),
 * the path may only contain the base resource name ("policy").
 * Returns a set containing all progressively shorter prefixes (excluding the full name, which is matched exactly).
 *
 * Example: "policy-overview" → Set{"policy"}
 * Example: "access-control-unit" → Set{"access-control", "access"}
 */
function buildEntityPrefixes(entityKebab: string): Set<string> {
  const parts = entityKebab.split("-");
  const prefixes = new Set<string>();
  for (let len = parts.length - 1; len >= 1; len--) {
    prefixes.add(parts.slice(0, len).join("-"));
  }
  return prefixes;
}

/**
 * Scan path segments backwards to find a custom action suffix.
 * Skips params, the entity's kebab-case name, API prefix, and version segments.
 * Returns the camelCase action name, or undefined if no action found.
 *
 * Examples:
 * - /api/v1/access-point/{id}/unpair → "unpair"
 * - /api/v1/access-point/{id}/pair/{targetId} → "pair"
 * - /api/v1/access-point → undefined
 */
function findActionSuffix(segments: string[], entityName: string): string | undefined {
  const entityKebab = entityName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const entityPrefixes = buildEntityPrefixes(entityKebab);
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.startsWith("{")) continue;
    if (seg === entityKebab || entityPrefixes.has(seg) || seg === "api" || /^v\d+$/.test(seg)) return undefined;
    return toCamelCase(seg);
  }
  return undefined;
}

/**
 * Build a compound action name from all non-param segments after the entity.
 * Used for GET sub-path operations (e.g. statistics endpoints).
 *
 * Examples:
 * - /api/v1/event/statistics/summary → "summary"
 * - /api/v1/event/statistics/controller-ranking → "controllerRanking"
 * - /api/v1/event/statistics/controller/{id}/timeline → "controllerTimeline"
 * - /api/v1/event → undefined (no sub-path)
 */
function findGetSubpath(segments: string[], entityName: string): string | undefined {
  const entityKebab = entityName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  let entityIdx = -1;
  // Exact match first
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === entityKebab) {
      entityIdx = i;
      break;
    }
  }

  // Prefix fallback: when entity name from tag has a qualifier suffix
  // (e.g., tag "pacs.policy.PolicyOverview" → "policy-overview")
  // but path uses only the base resource name (e.g., "/policy/summary")
  if (entityIdx < 0) {
    const prefixes = buildEntityPrefixes(entityKebab);
    for (let i = 0; i < segments.length; i++) {
      if (prefixes.has(segments[i])) {
        entityIdx = i;
        break;
      }
    }
  }

  if (entityIdx < 0) return undefined;

  const actionParts: string[] = [];
  for (let i = entityIdx + 1; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg.startsWith("{")) {
      actionParts.push(toCamelCase(seg));
    }
  }

  if (actionParts.length === 0) return undefined;

  return actionParts[0] + actionParts.slice(1)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

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
      // Custom GET sub-path: /entity/summary, /entity/controller/{id}/timeline
      const getAction = findGetSubpath(pathSegments, entity);
      if (getAction) {
        const actionPascal = getAction.charAt(0).toUpperCase() + getAction.slice(1);
        return { role: getAction, hookName: `get${pascal}${actionPascal}` };
      }
      // GET /entity (base path, no sub-path, no path param) → getAll
      // Distinct from GET /entity/search which is the paginated "list" role
      return { role: "getAll", hookName: `getAll${pascal}s` };
    }

    // --- POST patterns ---
    if (method === "POST") {
      if (lastSegment === "create") {
        return { role: "create", hookName: `create${pascal}` };
      }
      if (lastSegment === "search") {
        return { role: "search", hookName: `search${pascal}s` };
      }
      // Custom POST action: /entity/{id}/unpair, /entity/{id}/pair/{targetId}
      const postAction = findActionSuffix(pathSegments, entity);
      if (postAction) {
        return { role: postAction, hookName: `${postAction}${pascal}` };
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
      // Sub-resource DELETE: /entity/{id}/groups/{groupId}
      // Detected by counting non-param, non-api, non-version segments.
      // More than 1 resource segment means a sub-resource path.
      // Uses "delete" prefix to avoid collision with POST custom actions.
      const resourceSegments = pathSegments.filter(
        s => !s.startsWith("{") && s !== "api" && !/^v\d+$/.test(s),
      );
      if (resourceSegments.length > 1) {
        const action = toCamelCase(resourceSegments[resourceSegments.length - 1]);
        const actionPascal = action.charAt(0).toUpperCase() + action.slice(1);
        return { role: `delete${actionPascal}`, hookName: `delete${actionPascal}${pascal}` };
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
