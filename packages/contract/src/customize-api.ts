import type {
  ApiContractConfig,
  EntityDefinition,
  EntityOperationDef,
  FetchFn,
  OperationDefinition,
} from "./types.js";
import { deriveClient } from "./derive/client.js";
import { deriveQueryKeys } from "./derive/query-keys.js";

/**
 * Patch descriptor for a single entity's operations.
 *
 * - `null` removes the operation from the entity.
 * - An {@link EntityOperationDef} object adds or replaces the operation.
 */
export interface EntityPatch {
  operations?: Record<string, EntityOperationDef | null>;
}

/**
 * Patch descriptor applied to an API contract via {@link customizeApi}.
 *
 * Only the `entities` field is supported. Each key maps to an entity name
 * from the base contract, and the value describes operation-level changes.
 */
export interface ApiPatch {
  entities?: Record<string, EntityPatch>;
}

/**
 * Creates a patched copy of an API contract by adding, replacing, or removing
 * entity operations.
 *
 * The base contract is never mutated. A new contract is returned with
 * re-derived `client` and `queryKeys` reflecting the patched configuration.
 *
 * @param base - The original contract returned by {@link defineApi}, or any object with a `config` property.
 * @param patch - An {@link ApiPatch} describing the changes to apply.
 * @param options - Optional settings forwarded to the derived client.
 * @param options.fetchFn - Custom fetch function; defaults to the built-in {@link defaultFetch}.
 * @returns A new contract object with `config`, `client`, and `queryKeys`.
 *
 * @example
 * ```ts
 * import { customizeApi } from "@simplix-react/contract";
 * import { petApi as _petApi } from "./generated/contract.js";
 *
 * export const petApi = customizeApi(_petApi, {
 *   entities: {
 *     pet: {
 *       operations: {
 *         // Replace the list operation with a custom path
 *         list: { method: "GET", path: "/pet/findByStatus", role: "list" },
 *         // Remove operations that are no longer needed
 *         findByStatus: null,
 *         findByTags: null,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @see {@link defineApi} for creating the base contract.
 */
export function customizeApi<
  TEntities extends Record<string, EntityDefinition>,
  TOperations extends Record<string, OperationDefinition> = Record<string, never>,
>(
  base: { config: ApiContractConfig<TEntities, TOperations> },
  patch: ApiPatch,
  options?: { fetchFn?: FetchFn },
) {
  const patchedEntities = { ...base.config.entities } as Record<string, EntityDefinition>;

  if (patch.entities) {
    for (const [entityName, entityPatch] of Object.entries(patch.entities)) {
      const existing = patchedEntities[entityName];
      if (!existing) continue;

      if (entityPatch.operations) {
        const ops = { ...existing.operations };

        for (const [opName, opValue] of Object.entries(entityPatch.operations)) {
          if (opValue === null) {
            delete ops[opName];
          } else {
            ops[opName] = opValue;
          }
        }

        patchedEntities[entityName] = { ...existing, operations: ops };
      }
    }
  }

  const patchedConfig = {
    ...base.config,
    entities: patchedEntities,
  } as ApiContractConfig<TEntities, TOperations>;

  return {
    config: patchedConfig,
    client: deriveClient(patchedConfig, options?.fetchFn),
    queryKeys: deriveQueryKeys(patchedConfig),
  };
}
