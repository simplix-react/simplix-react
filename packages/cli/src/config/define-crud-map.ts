import type { CrudMap } from "./types.js";

/**
 * Identity function that provides type-safe autocompletion for `crud.config.ts`.
 *
 * @param map - Entity name → CRUD operation mapping
 * @returns The same map object, unchanged
 *
 * @example
 * ```ts
 * // crud.config.ts
 * import { defineCrudMap } from "@simplix-react/cli";
 *
 * export default defineCrudMap({
 *   pet: {
 *     list: "findPetsByStatus",
 *     get: "getPetById",
 *     create: "addPet",
 *     update: "updatePet",
 *     delete: "deletePet",
 *   },
 * });
 * ```
 */
export function defineCrudMap(map: CrudMap): CrudMap {
  return map;
}
