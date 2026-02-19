import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type {
  AnyEntityDef,
  AnyOperationDef,
  ApiContractConfig,
  EntityId,
  EntityOperationDef,
  ListParams,
  OperationDefinition,
  QueryKeyFactory,
} from "@simplix-react/contract";
import { resolveRole } from "@simplix-react/contract";
import type { EntityHooks, OperationHooks } from "./types.js";

/**
 * Derives type-safe React Query hooks from an API contract.
 *
 * Generates a complete set of hooks for every entity and operation defined in
 * the contract. Entity operations with CRUD roles produce specialized hooks
 * (`useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`).
 * Custom operations produce generic query or mutation hooks based on their HTTP method.
 *
 * @typeParam TEntities - Record of entity definitions from the contract
 * @typeParam TOperations - Record of operation definitions from the contract
 *
 * @param contract - The API contract produced by `defineApi()` from `@simplix-react/contract`,
 *   containing `config`, `client`, and `queryKeys`.
 *
 * @returns An object keyed by entity/operation name, each containing its derived hooks.
 *
 * @example
 * ```ts
 * import { defineApi } from "@simplix-react/contract";
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const inventoryContract = defineApi({
 *   domain: "inventory",
 *   basePath: "/api",
 *   entities: {
 *     product: {
 *       schema: productSchema,
 *       operations: {
 *         list:   { method: "GET",    path: "/products" },
 *         get:    { method: "GET",    path: "/products/:id" },
 *         create: { method: "POST",   path: "/products", input: createProductSchema },
 *         update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
 *         delete: { method: "DELETE", path: "/products/:id" },
 *         archive: { method: "POST",  path: "/products/:id/archive" },
 *       },
 *     },
 *   },
 * });
 *
 * const hooks = deriveHooks(inventoryContract);
 *
 * // CRUD hooks
 * hooks.product.useList();
 * hooks.product.useGet("id-1");
 * hooks.product.useCreate();
 *
 * // Custom operation hooks
 * hooks.product.useArchive();
 * ```
 *
 * @see {@link EntityHooks} for the per-entity hook interface.
 * @see {@link OperationHooks} for the per-operation hook interface.
 */
export function deriveHooks<
  TEntities extends Record<string, AnyEntityDef>,
  TOperations extends Record<string, AnyOperationDef>,
>(
  contract: {
    config: ApiContractConfig<TEntities, TOperations>;
    client: Record<string, unknown>;
    queryKeys: Record<string, QueryKeyFactory>;
  },
): DerivedHooksResult<TEntities, TOperations> {
  const { config, client, queryKeys } = contract;
  const result: Record<string, unknown> = {};

  // Entity hooks
  for (const entityName of Object.keys(config.entities)) {
    const entity = config.entities[entityName];
    const entityClient = client[entityName] as Record<string, (...args: unknown[]) => Promise<unknown>>;
    const keys = queryKeys[entityName];

    result[entityName] = createEntityHooks(entity, entityClient, keys, queryKeys, config);
  }

  // Top-level operation hooks
  if (config.operations) {
    for (const opName of Object.keys(config.operations)) {
      const operation = config.operations[opName];
      const opClient = client[opName] as (...args: unknown[]) => Promise<unknown>;

      result[opName] = createTopLevelOperationHooks(opClient, operation, queryKeys);
    }
  }

  return result as DerivedHooksResult<TEntities, TOperations>;
}

// ── Entity Hook Creators ──

function createEntityHooks(
  entity: AnyEntityDef,
  entityClient: Record<string, (...args: unknown[]) => Promise<unknown>>,
  keys: QueryKeyFactory,
  _allQueryKeys: Record<string, QueryKeyFactory>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _config: ApiContractConfig<any, any>,
) {
  const hooks: Record<string, unknown> = {};

  for (const [opName, op] of Object.entries(entity.operations) as [string, EntityOperationDef][]) {
    const role = resolveRole(opName, op);
    const hookName = `use${capitalize(opName)}`;

    switch (role) {
      case "list": {
        hooks[hookName] = createUseListHook(entity, entityClient[opName], keys);
        hooks.useInfiniteList = createUseInfiniteListHook(entity, entityClient[opName], keys);
        break;
      }
      case "get": {
        hooks[hookName] = createUseGetHook(entityClient[opName], keys);
        break;
      }
      case "create": {
        hooks[hookName] = createUseCreateHook(entity, entityClient[opName], keys);
        break;
      }
      case "update": {
        hooks[hookName] = createUseUpdateHook(entityClient[opName], keys);
        break;
      }
      case "delete": {
        hooks[hookName] = createUseDeleteHook(entityClient[opName], keys);
        break;
      }
      case "tree": {
        hooks[hookName] = createUseTreeHook(entityClient[opName], keys);
        break;
      }
      default: {
        // Custom operation — query for GET, mutation for others
        if (op.method === "GET") {
          hooks[hookName] = createGenericQueryHook(opName, entityClient[opName], keys);
        } else {
          hooks[hookName] = createGenericMutationHook(opName, op, entityClient[opName], keys);
        }
        break;
      }
    }
  }

  return hooks;
}

function createUseListHook(
  entity: AnyEntityDef,
  listFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useList(
    parentIdOrParams?: string | ListParams,
    paramsOrOptions?: ListParams | Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn">,
    options?: Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn">,
  ) {
    const { parentId, listParams, queryOptions } = resolveListArgs(
      parentIdOrParams,
      paramsOrOptions,
      options,
    );

    const keyParams: Record<string, unknown> = {};
    if (entity.parent && parentId) keyParams[entity.parent.param] = parentId;
    if (listParams) Object.assign(keyParams, listParams);

    return useQuery({
      queryKey: keys.list(keyParams),
      queryFn: async () => {
        const result = entity.parent
          ? await listFn(parentId, listParams)
          : await listFn(listParams);
        // Unwrap { data: T[], meta?: ... } envelope from paginated responses
        if (result && typeof result === "object" && !Array.isArray(result) && "data" in (result as Record<string, unknown>)) {
          return (result as { data: unknown[] }).data;
        }
        return result as unknown[];
      },
      enabled: entity.parent ? !!parentId : true,
      ...queryOptions,
    });
  };
}

function createUseGetHook(
  getFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useGet(
    id: EntityId,
    options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery<unknown, Error>({
      queryKey: keys.detail(id),
      queryFn: () => getFn(id),
      enabled: typeof id === "string" ? !!id : Object.keys(id).length > 0,
      ...options,
    });
  };
}

function createUseCreateHook(
  entity: AnyEntityDef,
  createFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useCreate(
    parentId?: string,
    options?: Omit<UseMutationOptions<unknown, Error, unknown>, "mutationFn">,
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (dto: unknown) => {
        if (entity.parent && parentId) {
          return createFn(parentId, dto);
        }
        return createFn(dto);
      },
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        options?.onSuccess?.(...args);
      },
      ...omit(options, ["onSuccess"]),
    });
  };
}

function createUseUpdateHook(
  updateFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useUpdate(
    options?: Omit<
      UseMutationOptions<unknown, Error, { id: EntityId; dto: unknown }>,
      "mutationFn"
    > & { optimistic?: boolean },
  ) {
    const queryClient = useQueryClient();
    const isOptimistic = options?.optimistic ?? false;

    return useMutation({
      mutationFn: ({ id, dto }: { id: EntityId; dto: unknown }) =>
        updateFn(id, dto),

      onMutate: isOptimistic
        ? async ({ id, dto }: { id: EntityId; dto: unknown }) => {
            await queryClient.cancelQueries({ queryKey: keys.all });
            const previousData = queryClient.getQueriesData<unknown[]>({ queryKey: keys.lists() });
            queryClient.setQueriesData<unknown[]>(
              { queryKey: keys.lists() },
              (old) =>
                old?.map((item) =>
                  isRecord(item) && matchesEntityId(item, id) ? { ...item, ...(dto as object) } : item,
                ),
            );
            return { previousData } as const;
          }
        : undefined,

      onError: isOptimistic
        ? (_err, _vars, context) => {
            const ctx = context as { previousData?: [readonly unknown[], unknown][] } | undefined;
            if (ctx?.previousData) {
              for (const [queryKey, data] of ctx.previousData) {
                queryClient.setQueryData(queryKey, data);
              }
            }
          }
        : undefined,

      onSuccess: (...args) => {
        options?.onSuccess?.(...args);
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },

      ...omit(options, ["onSuccess", "onMutate", "onError", "onSettled", "optimistic"]),
    });
  };
}

function createUseDeleteHook(
  deleteFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useDelete(
    options?: Omit<UseMutationOptions<void, Error, EntityId>, "mutationFn">,
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: EntityId) => deleteFn(id) as Promise<void>,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        options?.onSuccess?.(...args);
      },
      ...omit(options, ["onSuccess"]),
    });
  };
}

function createUseInfiniteListHook(
  entity: AnyEntityDef,
  listFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useInfiniteList(
    parentId?: string,
    params?: Omit<ListParams, "pagination"> & { limit?: number },
    options?: Record<string, unknown>,
  ) {
    const limit = params?.limit ?? 20;

    const keyParams: Record<string, unknown> = { infinite: true };
    if (entity.parent && parentId) keyParams[entity.parent.param] = parentId;
    if (params?.filters) keyParams.filters = params.filters;
    if (params?.sort) keyParams.sort = params.sort;

    return useInfiniteQuery({
      queryKey: keys.list(keyParams),
      queryFn: ({ pageParam }) => {
        const pagination = typeof pageParam === "string"
          ? { type: "cursor" as const, cursor: pageParam, limit }
          : { type: "offset" as const, page: (pageParam as number) ?? 1, limit };

        const listParams: ListParams = {
          filters: params?.filters,
          sort: params?.sort,
          pagination,
        };

        if (entity.parent) {
          return listFn(parentId, listParams);
        }
        return listFn(listParams);
      },
      initialPageParam: 1 as unknown,
      getNextPageParam: (lastPage: unknown, _allPages: unknown[], lastPageParam: unknown) => {
        const page = lastPage as { meta?: { hasNextPage?: boolean; nextCursor?: string } };
        if (!page.meta?.hasNextPage) return undefined;
        if (page.meta.nextCursor) return page.meta.nextCursor;
        return typeof lastPageParam === "number" ? lastPageParam + 1 : undefined;
      },
      enabled: entity.parent ? !!parentId : true,
      ...options,
    });
  };
}

function createUseTreeHook(
  treeFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useTree(
    params?: Record<string, unknown>,
    options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery({
      queryKey: keys.tree(params),
      queryFn: () => treeFn(params),
      ...options,
    });
  };
}

function createGenericQueryHook(
  opName: string,
  opFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useGenericQuery(
    params?: Record<string, unknown>,
    options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery({
      queryKey: keys.list({ operation: opName, ...params }),
      queryFn: () => opFn(params),
      ...options,
    });
  };
}

function createGenericMutationHook(
  _opName: string,
  op: EntityOperationDef,
  opFn: (...args: unknown[]) => Promise<unknown>,
  keys: QueryKeyFactory,
) {
  return function useGenericMutation(
    options?: Omit<UseMutationOptions<unknown, Error, unknown>, "mutationFn">,
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (...args: unknown[]) => opFn(...args),
      onSuccess: (...args) => {
        // Invalidate entity queries for write operations
        if (op.invalidates) {
          const keysToInvalidate = op.invalidates({ [_opName]: keys }, {});
          for (const key of keysToInvalidate) {
            queryClient.invalidateQueries({ queryKey: key as unknown[] });
          }
        } else {
          queryClient.invalidateQueries({ queryKey: keys.all });
        }
        options?.onSuccess?.(...args);
      },
      ...omit(options, ["onSuccess"]),
    });
  };
}

// ── Top-level Operation Hook Creators ──

function createTopLevelOperationHooks(
  opClient: (...args: unknown[]) => Promise<unknown>,
  operation: AnyOperationDef,
  allQueryKeys: Record<string, QueryKeyFactory>,
) {
  return {
    useMutation(
      options?: Omit<UseMutationOptions<unknown, Error, unknown>, "mutationFn">,
    ) {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (input: unknown) => opClient(input),
        onSuccess: (...args) => {
          if (operation.invalidates) {
            const keysToInvalidate = operation.invalidates(allQueryKeys, {});
            for (const key of keysToInvalidate) {
              queryClient.invalidateQueries({ queryKey: key as unknown[] });
            }
          }
          options?.onSuccess?.(...args);
        },
        ...omit(options, ["onSuccess"]),
      });
    },
  };
}

// ── Utility ──

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function omit<T extends Record<string, unknown>>(
  obj: T | undefined,
  keys: string[],
): Partial<T> {
  if (!obj) return {};
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

function matchesEntityId(item: Record<string, unknown>, id: EntityId): boolean {
  if (typeof id === "string") return String(item.id) === id;
  return Object.entries(id).every(([key, value]) => String(item[key]) === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isListParams(value: unknown): value is ListParams {
  if (!isRecord(value)) return false;
  return "filters" in value || "sort" in value || "pagination" in value;
}

function resolveListArgs(
  firstArg: unknown,
  secondArg: unknown,
  thirdArg: unknown,
): {
  parentId?: string;
  listParams?: ListParams;
  queryOptions?: Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn">;
} {
  // useList("parentId", { filters }, options)
  if (typeof firstArg === "string") {
    return {
      parentId: firstArg,
      listParams: isListParams(secondArg) ? secondArg : undefined,
      queryOptions: isListParams(secondArg)
        ? (thirdArg as Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn"> | undefined)
        : (secondArg as Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn"> | undefined),
    };
  }

  // useList({ filters }, options)
  if (isListParams(firstArg)) {
    return {
      listParams: firstArg,
      queryOptions: secondArg as Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn"> | undefined,
    };
  }

  // useList(options) or useList()
  return {
    queryOptions: firstArg as Omit<UseQueryOptions<unknown[], Error>, "queryKey" | "queryFn"> | undefined,
  };
}

// ── Result Type ──

export type DerivedHooksResult<
  TEntities extends Record<string, AnyEntityDef>,
  TOperations extends Record<string, AnyOperationDef>,
> = {
  [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]>;
} & {
  [K in keyof TOperations]: TOperations[K] extends OperationDefinition<
    infer TInput,
    infer TOutput
  >
    ? OperationHooks<TInput, TOutput>
    : never;
};
