import type { CrudRole, EntityOperationDef } from "../types.js";

const CRUD_NAMES = new Set<string>(["list", "get", "create", "update", "delete", "tree"]);

/**
 * Resolves the CRUD role for an entity operation.
 *
 * Returns the explicit `role` if specified, otherwise infers it from the
 * operation name if it matches a standard CRUD name.
 *
 * @param name - The operation key name (e.g. `"list"`, `"archive"`).
 * @param operation - The operation definition.
 * @returns The resolved CRUD role, or `undefined` for custom operations.
 *
 * @example
 * ```ts
 * resolveRole("list", { method: "GET", path: "/products" });
 * // "list"
 *
 * resolveRole("fetchAll", { method: "GET", path: "/products", role: "list" });
 * // "list"
 *
 * resolveRole("archive", { method: "POST", path: "/products/:id/archive" });
 * // undefined
 * ```
 */
export function resolveRole(
  name: string,
  operation: EntityOperationDef,
): CrudRole | undefined {
  if (operation.role) return operation.role;
  if (CRUD_NAMES.has(name)) return name as CrudRole;
  return undefined;
}
