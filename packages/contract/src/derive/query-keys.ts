import type {
  ApiContractConfig,
  EntityDefinition,
  EntityId,
  QueryKeyFactory,
} from "../types.js";

/**
 * Derives a set of {@link QueryKeyFactory} instances for all entities in a contract.
 *
 * Generates structured query keys following the factory pattern recommended
 * by TanStack Query. Each entity receives keys scoped by `[domain, entityName]`,
 * enabling granular cache invalidation (e.g. invalidate all product lists without
 * affecting product details).
 *
 * Typically called internally by {@link defineApi} rather than used directly.
 *
 * @typeParam TEntities - Map of entity names to their definitions.
 * @param config - Subset of the API contract config containing `domain` and `entities`.
 * @returns A map of entity names to their {@link QueryKeyFactory} instances.
 *
 * @example
 * ```ts
 * import { deriveQueryKeys } from "@simplix-react/contract";
 *
 * const queryKeys = deriveQueryKeys({ domain: "inventory", entities: { product: productEntity } });
 *
 * queryKeys.product.all;              // ["inventory", "product"]
 * queryKeys.product.lists();          // ["inventory", "product", "list"]
 * queryKeys.product.detail("abc");    // ["inventory", "product", "detail", "abc"]
 * queryKeys.product.trees();          // ["inventory", "product", "tree"]
 * queryKeys.product.tree({ rootId: "x" }); // ["inventory", "product", "tree", { rootId: "x" }]
 * ```
 *
 * @see {@link defineApi} for the recommended high-level API.
 * @see {@link QueryKeyFactory} for the generated key structure.
 */
export function deriveQueryKeys<
  TEntities extends Record<string, EntityDefinition>,
>(
  config: Pick<ApiContractConfig<TEntities>, "domain" | "entities">,
): { [K in keyof TEntities]: QueryKeyFactory } {
  const { domain, entities } = config;
  const result: Record<string, QueryKeyFactory> = {};

  for (const entityName of Object.keys(entities)) {
    result[entityName] = createQueryKeyFactory(domain, entityName);
  }

  return result as { [K in keyof TEntities]: QueryKeyFactory };
}

function createQueryKeyFactory(
  domain: string,
  entity: string,
): QueryKeyFactory {
  return {
    all: [domain, entity] as const,
    lists: () => [domain, entity, "list"] as const,
    list: (params: Record<string, unknown>) =>
      [domain, entity, "list", params] as const,
    details: () => [domain, entity, "detail"] as const,
    detail: (id: EntityId) =>
      [domain, entity, "detail", id] as const,
    trees: () => [domain, entity, "tree"] as const,
    tree: (params?: Record<string, unknown>) =>
      params
        ? ([domain, entity, "tree", params] as const)
        : ([domain, entity, "tree"] as const),
  };
}
