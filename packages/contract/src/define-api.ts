import type {
  ApiContractConfig,
  EntityDefinition,
  FetchFn,
  OperationDefinition,
} from "./types.js";
import { deriveClient } from "./derive/client.js";
import { deriveQueryKeys } from "./derive/query-keys.js";

/**
 * Creates a fully-typed API contract from an {@link ApiContractConfig}.
 *
 * Serves as the main entry point for `@simplix-react/contract`. Takes a
 * declarative config of entities and operations, then derives a type-safe
 * HTTP client and query key factories. The returned contract is consumed
 * by `@simplix-react/react` for hooks and `@simplix-react/mock` for MSW handlers.
 *
 * @typeParam TEntities - Map of entity names to their {@link EntityDefinition}s.
 * @typeParam TOperations - Map of operation names to their {@link OperationDefinition}s.
 *
 * @param config - The API contract configuration defining entities, operations, and shared settings.
 * @param options - Optional settings for customizing the contract.
 * @param options.fetchFn - Custom fetch function replacing the built-in {@link defaultFetch}.
 * @returns An {@link ApiContract} containing `config`, `client`, and `queryKeys`.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
 *
 * const inventoryApi = defineApi({
 *   domain: "inventory",
 *   basePath: "/api/v1",
 *   entities: {
 *     product: {
 *       schema: productSchema,
 *       operations: {
 *         list:   { method: "GET",    path: "/products" },
 *         get:    { method: "GET",    path: "/products/:id" },
 *         create: { method: "POST",   path: "/products", input: createProductSchema },
 *         update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
 *         delete: { method: "DELETE", path: "/products/:id" },
 *       },
 *     },
 *   },
 *   queryBuilder: simpleQueryBuilder,
 * });
 *
 * // Type-safe client usage
 * const products = await inventoryApi.client.product.list();
 * const product = await inventoryApi.client.product.get("product-1");
 *
 * // Query keys for TanStack Query
 * inventoryApi.queryKeys.product.all;       // ["inventory", "product"]
 * inventoryApi.queryKeys.product.detail("product-1"); // ["inventory", "product", "detail", "product-1"]
 * ```
 *
 * @see {@link ApiContractConfig} for the full config shape.
 * @see {@link @simplix-react/react!deriveHooks | deriveHooks} for deriving React Query hooks.
 * @see {@link @simplix-react/mock!deriveMockHandlers | deriveMockHandlers} for deriving MSW handlers.
 */
export function defineApi<
  TEntities extends Record<string, EntityDefinition>,
  TOperations extends Record<
    string,
    OperationDefinition
  > = Record<string, never>,
>(
  config: ApiContractConfig<TEntities, TOperations>,
  options?: { fetchFn?: FetchFn },
) {
  return {
    config,
    client: deriveClient(config, options?.fetchFn),
    queryKeys: deriveQueryKeys(config),
  };
}
