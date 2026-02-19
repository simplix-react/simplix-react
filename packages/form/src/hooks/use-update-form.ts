import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import type { z } from "zod";
import type { AnyEntityHooks } from "../types.js";
import type { UpdateFormOptions, UpdateFormReturn } from "../types.js";
import { extractDirtyFields } from "../utils/dirty-fields.js";
import { mapServerErrorsToForm } from "../utils/server-error-mapping.js";

/**
 * Creates a `useUpdateForm` hook bound to a specific entity's query and update mutation.
 *
 * @remarks
 * The returned hook performs three tasks automatically:
 *
 * 1. **Loads existing data** — calls `useGet(entityId)` and populates the
 *    form's `defaultValues` with the server entity.
 * 2. **Dirty-field extraction** — when `dirtyOnly` is `true` (the default),
 *    only fields that differ from the loaded entity are sent in the PATCH
 *    payload via {@link extractDirtyFields}.
 * 3. **Server error mapping** — on 422 responses, field-level errors are
 *    mapped back into the form via {@link mapServerErrorsToForm}.
 *
 * The form resets whenever the server entity data changes (e.g. after a
 * background refetch). This uses `dataUpdatedAt` from React Query to
 * avoid infinite re-render loops caused by object reference changes.
 *
 * This is an internal factory consumed by `createEntityFormHooks` —
 * end users interact with the derived `useUpdateForm` hook instead.
 *
 * @param entityHooks - Pre-derived entity hooks containing `useGet` and `useUpdate`
 * @returns A `useUpdateForm(entityId, options?)` hook function
 *
 * @example
 * ```ts
 * // Internal usage within createEntityFormHooks:
 * const useUpdateForm = createUseUpdateForm(entityHooks);
 *
 * // Consumer usage (via deriveFormHooks):
 * const { form, isLoading, isSubmitting, entity } = formHooks.task.useUpdateForm(taskId, {
 *   dirtyOnly: true,
 *   onSuccess: (data) => console.log("Updated:", data),
 * });
 *
 * if (isLoading) return <Spinner />;
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
 *
 * @see {@link UpdateFormOptions} for available hook options
 * @see {@link UpdateFormReturn} for the return value shape
 * @see {@link extractDirtyFields} for the dirty-field comparison logic
 * @see {@link mapServerErrorsToForm} for server error handling
 */
export function createUseUpdateForm(
  entityHooks: AnyEntityHooks,
) {
  return function useUpdateForm(
    entityId: string,
    options?: UpdateFormOptions,
  ): UpdateFormReturn<z.ZodTypeAny> {
    const [submitError, setSubmitError] = useState<Error | null>(null);
    const dirtyOnly = options?.dirtyOnly ?? true;

    const queryResult = entityHooks.useGet(entityId) as {
      data: unknown;
      isLoading: boolean;
      dataUpdatedAt: number;
    };
    const { data: entity, isLoading, dataUpdatedAt } = queryResult;

    const updateMutation = entityHooks.useUpdate({
      onSuccess: (data: unknown) => {
        setSubmitError(null);
        options?.onSuccess?.(data);
      },
    }) as { mutateAsync: (value: unknown) => Promise<unknown>; isPending: boolean };

    const form = useForm({
      defaultValues: (entity ?? {}) as Record<string, unknown>,
      onSubmit: async ({ value }) => {
        // Guard: prevent submit with dirty-only mode when entity is not loaded
        if (dirtyOnly && !entity) return;

        try {
          setSubmitError(null);
          const dto = dirtyOnly
            ? extractDirtyFields(
                value as Record<string, unknown>,
                (entity ?? {}) as Record<string, unknown>,
              )
            : value;
          await updateMutation.mutateAsync({ id: entityId, dto });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          setSubmitError(err);
          mapServerErrorsToForm(error, form);
          options?.onError?.(err);
        }
      },
    });

    // Reset form when entity data changes (e.g. after refetch).
    // Use dataUpdatedAt as dependency to avoid infinite re-render from object reference changes.
    const prevUpdatedAtRef = useRef(dataUpdatedAt);
    useEffect(() => {
      if (entity && dataUpdatedAt !== prevUpdatedAtRef.current) {
        prevUpdatedAtRef.current = dataUpdatedAt;
        form.reset(entity as Record<string, unknown>);
      }
    }, [entity, dataUpdatedAt, form]);

    return {
      form,
      isLoading,
      isSubmitting: updateMutation.isPending,
      submitError,
      entity: entity as Record<string, unknown> | undefined,
    };
  };
}
