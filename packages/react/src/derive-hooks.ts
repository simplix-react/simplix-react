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
  ListParams,
  OperationDefinition,
  QueryKeyFactory,
} from "@simplix-react/contract";
import type { EntityHooks, OperationHooks } from "./types.js";

/**
 * Derives type-safe React Query hooks from an API contract.
 *
 * Generates a complete set of hooks for every entity and operation defined in
 * the contract. Entity hooks include `useList`, `useGet`, `useCreate`,
 * `useUpdate`, `useDelete`, and `useInfiniteList`. Operation hooks provide
 * a single `useMutation` with automatic cache invalidation.
 *
 * All hooks support full TanStack Query options passthrough — callers can
 * provide any option except `queryKey`/`queryFn` (for queries) or
 * `mutationFn` (for mutations), which are managed internally.
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
 * import { z } from "zod";
 *
 * const projectContract = defineApi({
 *   domain: "project",
 *   basePath: "/api",
 *   entities: {
 *     task: {
 *       path: "/tasks",
 *       schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
 *       createSchema: z.object({ title: z.string(), status: z.string() }),
 *       updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
 *     },
 *   },
 * });
 *
 * // Derive all hooks at once
 * const hooks = deriveHooks(projectContract);
 *
 * // Use in components
 * function TaskList() {
 *   const { data: tasks } = hooks.task.useList();
 *   const createTask = hooks.task.useCreate();
 *   // ...
 * }
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
    const entityClient = client[entityName] as EntityClientShape;
    const keys = queryKeys[entityName];

    result[entityName] = createEntityHooks(entity, entityClient, keys, queryKeys, config);
  }

  // Operation hooks
  if (config.operations) {
    for (const opName of Object.keys(config.operations)) {
      const operation = config.operations[opName];
      const opClient = client[opName] as (...args: unknown[]) => Promise<unknown>;

      result[opName] = createOperationHooks(opClient, operation, queryKeys);
    }
  }

  return result as DerivedHooksResult<TEntities, TOperations>;
}

// ── Internal Types ──

interface EntityClientShape {
  list: (parentIdOrParams?: string | ListParams, params?: ListParams) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  create: (parentIdOrDto: unknown, dto?: unknown) => Promise<unknown>;
  update: (id: string, dto: unknown) => Promise<unknown>;
  delete: (id: string) => Promise<void>;
}

// ── Entity Hook Creators ──

function createEntityHooks(
  entity: AnyEntityDef,
  entityClient: EntityClientShape,
  keys: QueryKeyFactory,
  _allQueryKeys: Record<string, QueryKeyFactory>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _config: ApiContractConfig<any, any>,
) {
  return {
    useList: createUseListHook(entity, entityClient, keys),
    useGet: createUseGetHook(entityClient, keys),
    useCreate: createUseCreateHook(entity, entityClient, keys),
    useUpdate: createUseUpdateHook(entityClient, keys),
    useDelete: createUseDeleteHook(entityClient, keys),
    useInfiniteList: createUseInfiniteListHook(entity, entityClient, keys),
  };
}

function createUseListHook(
  entity: AnyEntityDef,
  entityClient: EntityClientShape,
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
      queryFn: () => {
        if (entity.parent) {
          return entityClient.list(parentId, listParams) as Promise<unknown[]>;
        }
        return entityClient.list(listParams) as Promise<unknown[]>;
      },
      enabled: entity.parent ? !!parentId : true,
      ...queryOptions,
    });
  };
}

function createUseGetHook(
  entityClient: EntityClientShape,
  keys: QueryKeyFactory,
) {
  return function useGet(
    id: string,
    options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery<unknown, Error>({
      queryKey: keys.detail(id),
      queryFn: () => entityClient.get(id),
      enabled: !!id,
      ...options,
    });
  };
}

function createUseCreateHook(
  entity: AnyEntityDef,
  entityClient: EntityClientShape,
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
          return entityClient.create(parentId, dto);
        }
        return entityClient.create(dto);
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
  entityClient: EntityClientShape,
  keys: QueryKeyFactory,
) {
  return function useUpdate(
    options?: Omit<
      UseMutationOptions<unknown, Error, { id: string; dto: unknown }>,
      "mutationFn"
    > & { optimistic?: boolean },
  ) {
    const queryClient = useQueryClient();
    const isOptimistic = options?.optimistic ?? false;

    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: unknown }) =>
        entityClient.update(id, dto),

      onMutate: isOptimistic
        ? async ({ id, dto }: { id: string; dto: unknown }) => {
            await queryClient.cancelQueries({ queryKey: keys.all });
            const previousData = queryClient.getQueriesData<unknown[]>({ queryKey: keys.lists() });
            queryClient.setQueriesData<unknown[]>(
              { queryKey: keys.lists() },
              (old) =>
                old?.map((item) =>
                  isRecord(item) && item.id === id ? { ...item, ...(dto as object) } : item,
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
  entityClient: EntityClientShape,
  keys: QueryKeyFactory,
) {
  return function useDelete(
    options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => entityClient.delete(id),
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
  entityClient: EntityClientShape,
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
          return entityClient.list(parentId, listParams);
        }
        return entityClient.list(listParams);
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

// ── Operation Hook Creators ──

function createOperationHooks(
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
          // C7: invalidate based on operation config
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
  [K in keyof TEntities]: EntityHooks<
    TEntities[K]["schema"],
    TEntities[K]["createSchema"],
    TEntities[K]["updateSchema"]
  >;
} & {
  [K in keyof TOperations]: TOperations[K] extends OperationDefinition<
    infer TInput,
    infer TOutput
  >
    ? OperationHooks<TInput, TOutput>
    : never;
};
