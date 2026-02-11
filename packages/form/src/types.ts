import type { z } from "zod";
import type { AnyFormApi } from "@tanstack/react-form";
import type { EntityDefinition } from "@simplix-react/contract";
import type { EntityHooks } from "@simplix-react/react";

// Shared internal type aliases — single source of truth (CLAUDE.md Critical Rule #2)

/** Shorthand for an entity definition with any Zod schema types. */
export type AnyEntityDef = EntityDefinition<z.ZodTypeAny, z.ZodTypeAny, z.ZodTypeAny>;

/** Shorthand for entity hooks with any Zod schema types. */
export type AnyEntityHooks = EntityHooks<z.ZodTypeAny, z.ZodTypeAny, z.ZodTypeAny>;

/**
 * Options for the `useCreateForm` hook.
 *
 * @typeParam TCreate - Zod schema type for the create DTO
 *
 * @example
 * ```ts
 * const { form } = formHooks.task.useCreateForm(projectId, {
 *   defaultValues: { title: "", status: "open" },
 *   resetOnSuccess: true,
 *   onSuccess: (data) => console.log("Created:", data),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export interface CreateFormOptions<TCreate extends z.ZodTypeAny> {
  /** Initial form field values. */
  defaultValues?: Partial<z.infer<TCreate>>;
  /** Reset the form after successful submission. Defaults to `true`. */
  resetOnSuccess?: boolean;
  /** Callback invoked after a successful mutation. */
  onSuccess?: (data: unknown) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: Error) => void;
}

/**
 * Options for the `useUpdateForm` hook.
 *
 * @example
 * ```ts
 * const { form } = formHooks.task.useUpdateForm(taskId, {
 *   dirtyOnly: true,
 *   onSuccess: (data) => console.log("Updated:", data),
 * });
 * ```
 */
export interface UpdateFormOptions {
  /** Send only changed fields to the server (PATCH-friendly). Defaults to `true`. */
  dirtyOnly?: boolean;
  /** Callback invoked after a successful mutation. */
  onSuccess?: (data: unknown) => void;
  /** Callback invoked when the mutation fails. */
  onError?: (error: Error) => void;
}

/**
 * Return value of the `useCreateForm` hook.
 *
 * @example
 * ```ts
 * const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm();
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
 *     <form.Field name="title">
 *       {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
 *     </form.Field>
 *     <button type="submit" disabled={isSubmitting}>Create</button>
 *     {submitError && <p>{submitError.message}</p>}
 *   </form>
 * );
 * ```
 */
export interface CreateFormReturn {
  /** TanStack Form API instance for field binding and submission. */
  form: AnyFormApi;
  /** Whether the create mutation is currently in flight. */
  isSubmitting: boolean;
  /** The most recent submission error, or `null` if the last attempt succeeded. */
  submitError: Error | null;
  /** Resets the form fields and clears the submission error. */
  reset: () => void;
}

/**
 * Return value of the `useUpdateForm` hook.
 *
 * @typeParam TSchema - Zod schema type for the entity
 *
 * @example
 * ```ts
 * const { form, isLoading, isSubmitting, entity } = formHooks.task.useUpdateForm(taskId);
 *
 * if (isLoading) return <p>Loading...</p>;
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
 *     <form.Field name="title">
 *       {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
 *     </form.Field>
 *     <button type="submit" disabled={isSubmitting}>Save</button>
 *   </form>
 * );
 * ```
 */
export interface UpdateFormReturn<TSchema extends z.ZodTypeAny> {
  /** TanStack Form API instance for field binding and submission. */
  form: AnyFormApi;
  /** Whether the entity data is still loading from the server. */
  isLoading: boolean;
  /** Whether the update mutation is currently in flight. */
  isSubmitting: boolean;
  /** The most recent submission error, or `null` if the last attempt succeeded. */
  submitError: Error | null;
  /** The loaded entity data, or `undefined` while loading. */
  entity: z.infer<TSchema> | undefined;
}

/**
 * Hook signature for creating a new entity via a TanStack Form instance.
 *
 * @typeParam TCreate - Zod schema type for the create DTO
 *
 * @see {@link CreateFormOptions} for available options
 * @see {@link CreateFormReturn} for the return value shape
 */
export type DerivedCreateFormHook<TCreate extends z.ZodTypeAny> = (
  parentId?: string,
  options?: CreateFormOptions<TCreate>,
) => CreateFormReturn;

/**
 * Hook signature for updating an existing entity via a TanStack Form instance.
 *
 * @typeParam TSchema - Zod schema type for the entity
 *
 * @see {@link UpdateFormOptions} for available options
 * @see {@link UpdateFormReturn} for the return value shape
 */
export type DerivedUpdateFormHook<TSchema extends z.ZodTypeAny> = (
  entityId: string,
  options?: UpdateFormOptions,
) => UpdateFormReturn<TSchema>;

/**
 * Form hook set for a single entity, containing `useCreateForm` and `useUpdateForm`.
 *
 * @remarks
 * Produced by `deriveFormHooks()` for each entity in the contract.
 * Each hook wires a TanStack Form instance to the entity's React Query
 * mutations with automatic dirty-field extraction and server error mapping.
 *
 * @typeParam TSchema - Entity's Zod schema type
 * @typeParam TCreate - Creation input Zod schema type
 *
 * @example
 * ```ts
 * import { deriveFormHooks } from "@simplix-react/form";
 *
 * const formHooks = deriveFormHooks(projectApi, projectHooks);
 * // formHooks.task: EntityFormHooks<TaskSchema, CreateTaskSchema>
 * // formHooks.task.useCreateForm(parentId?, options?)
 * // formHooks.task.useUpdateForm(entityId, options?)
 * ```
 *
 * @see {@link deriveFormHooks} — derives form hooks from a contract
 */
export interface EntityFormHooks<
  TSchema extends z.ZodTypeAny,
  TCreate extends z.ZodTypeAny,
> {
  /** Hook for creating a new entity with a managed form. */
  useCreateForm: DerivedCreateFormHook<TCreate>;
  /** Hook for updating an existing entity with a managed form. */
  useUpdateForm: DerivedUpdateFormHook<TSchema>;
}
