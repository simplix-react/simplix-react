import type {
  UseQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import type { ListParams, PageInfo } from "@simplix-react/contract";
import type { z } from "zod";

/**
 * Represents a derived list query hook with overloaded call signatures.
 *
 * Supports three calling conventions:
 * - `useList(options?)` — top-level entity list
 * - `useList(params, options?)` — filtered/sorted list
 * - `useList(parentId, params?, options?)` — child entity list
 *
 * All TanStack Query options except `queryKey` and `queryFn` can be passed through.
 *
 * @typeParam TData - The entity type returned by the query
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const { data: tasks } = hooks.task.useList(projectId, {
 *   filters: { status: "open" },
 *   sort: { field: "createdAt", direction: "desc" },
 * });
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedListHook<TData> = (
  parentIdOrParams?: string | ListParams,
  paramsOrOptions?: ListParams | Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
  options?: Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData[]>;

/**
 * Represents a derived detail query hook that fetches a single entity by ID.
 *
 * Automatically disables the query when `id` is falsy.
 *
 * @typeParam TData - The entity type returned by the query
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const { data: task } = hooks.task.useGet(taskId);
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedGetHook<TData> = (
  id: string,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData>;

/**
 * Represents a derived create mutation hook.
 *
 * Automatically invalidates all entity queries on success.
 * For child entities, accepts a `parentId` as the first argument.
 *
 * @typeParam TInput - The create DTO type (inferred from the entity's createSchema)
 * @typeParam TOutput - The entity type returned after creation
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const createTask = hooks.task.useCreate(projectId);
 * createTask.mutate({ title: "New task", status: "open" });
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedCreateHook<TInput, TOutput> = (
  parentId?: string,
  options?: Omit<
    UseMutationOptions<TOutput, Error, TInput>,
    "mutationFn"
  >,
) => UseMutationResult<TOutput, Error, TInput>;

/**
 * Represents a derived update mutation hook.
 *
 * Accepts `{ id, dto }` as mutation variables. Supports optimistic updates
 * via the `optimistic` option. Automatically invalidates all entity queries
 * on settlement.
 *
 * @typeParam TInput - The update DTO type (inferred from the entity's updateSchema)
 * @typeParam TOutput - The entity type returned after update
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const updateTask = hooks.task.useUpdate({ optimistic: true });
 * updateTask.mutate({ id: taskId, dto: { status: "done" } });
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedUpdateHook<TInput, TOutput> = (
  options?: Omit<
    UseMutationOptions<TOutput, Error, { id: string; dto: TInput }>,
    "mutationFn"
  >,
) => UseMutationResult<TOutput, Error, { id: string; dto: TInput }>;

/**
 * Represents a derived delete mutation hook.
 *
 * Accepts the entity ID as the mutation variable. Automatically invalidates
 * all entity queries on success.
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const deleteTask = hooks.task.useDelete();
 * deleteTask.mutate(taskId);
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedDeleteHook = (
  options?: Omit<
    UseMutationOptions<void, Error, string>,
    "mutationFn"
  >,
) => UseMutationResult<void, Error, string>;

/**
 * Represents a derived infinite list query hook for cursor-based or offset-based pagination.
 *
 * Automatically determines the next page parameter from the response `meta` field.
 * Pagination parameters are managed internally; callers provide only filters, sort,
 * and an optional page size limit.
 *
 * @typeParam TData - The entity type returned in each page
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const { data, fetchNextPage, hasNextPage } = hooks.task.useInfiniteList(
 *   projectId,
 *   { limit: 10, filters: { status: "open" } },
 * );
 * ```
 *
 * @see {@link EntityHooks} for the complete set of entity hooks.
 */
export type DerivedInfiniteListHook<TData> = (
  parentId?: string,
  params?: Omit<ListParams, "pagination"> & { limit?: number },
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<
  { data: TData[]; meta: PageInfo },
  Error
>;

/**
 * Represents the complete set of React Query hooks derived from an entity definition.
 *
 * Each entity in the contract produces an object conforming to this interface,
 * with hooks for CRUD operations and infinite scrolling.
 *
 * @typeParam TSchema - The Zod schema defining the entity shape
 * @typeParam TCreate - The Zod schema defining the create DTO shape
 * @typeParam TUpdate - The Zod schema defining the update DTO shape
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 *
 * // hooks.task satisfies EntityHooks<TaskSchema, CreateTaskSchema, UpdateTaskSchema>
 * const { data } = hooks.task.useList();
 * const { data: single } = hooks.task.useGet(id);
 * const create = hooks.task.useCreate();
 * const update = hooks.task.useUpdate();
 * const remove = hooks.task.useDelete();
 * const infinite = hooks.task.useInfiniteList();
 * ```
 *
 * @see {@link deriveHooks} for generating these hooks from a contract.
 */
export interface EntityHooks<
  TSchema extends z.ZodTypeAny,
  TCreate extends z.ZodTypeAny,
  TUpdate extends z.ZodTypeAny,
> {
  useList: DerivedListHook<z.infer<TSchema>>;
  useGet: DerivedGetHook<z.infer<TSchema>>;
  useCreate: DerivedCreateHook<z.infer<TCreate>, z.infer<TSchema>>;
  useUpdate: DerivedUpdateHook<z.infer<TUpdate>, z.infer<TSchema>>;
  useDelete: DerivedDeleteHook;
  useInfiniteList: DerivedInfiniteListHook<z.infer<TSchema>>;
}

/**
 * Represents a derived mutation hook for a custom operation.
 *
 * Wraps the operation client function with TanStack Query's `useMutation`.
 * All mutation options except `mutationFn` can be passed through.
 *
 * @typeParam TInput - The input type for the operation
 * @typeParam TOutput - The output type for the operation
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const archiveProject = hooks.archiveProject.useMutation();
 * archiveProject.mutate({ projectId: "abc" });
 * ```
 *
 * @see {@link OperationHooks} for the operation hooks container.
 */
export type OperationMutationHook<TInput, TOutput> = (
  options?: Omit<
    UseMutationOptions<TOutput, Error, TInput>,
    "mutationFn"
  >,
) => UseMutationResult<TOutput, Error, TInput>;

/**
 * Represents the hook container for a custom operation defined in the contract.
 *
 * Each operation in the contract produces an object with a single `useMutation` hook.
 * Cache invalidation is handled automatically based on the operation's `invalidates`
 * configuration in the contract.
 *
 * @typeParam TInput - The Zod schema defining the operation input
 * @typeParam TOutput - The Zod schema defining the operation output
 *
 * @example
 * ```ts
 * import { deriveHooks } from "@simplix-react/react";
 *
 * const hooks = deriveHooks(projectContract);
 * const { mutate, isPending } = hooks.archiveProject.useMutation({
 *   onSuccess: () => console.log("Project archived"),
 * });
 * ```
 *
 * @see {@link deriveHooks} for generating hooks from a contract.
 */
export interface OperationHooks<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
> {
  useMutation: OperationMutationHook<z.infer<TInput>, z.infer<TOutput>>;
}
