import { useState, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import type { z } from "zod";
import type { AnyEntityHooks } from "../types.js";
import type { CreateFormOptions, CreateFormReturn } from "../types.js";
import { mapServerErrorsToForm } from "../utils/server-error-mapping.js";

/**
 * Creates a `useCreateForm` hook bound to a specific entity's create mutation.
 *
 * @remarks
 * The returned hook wires a TanStack Form instance to the entity's
 * `useCreate` mutation. On submit the form values are passed directly
 * to `mutateAsync`, and the form resets automatically on success
 * (configurable via `resetOnSuccess`).
 *
 * When the mutation returns a 422 status, field-level server errors are
 * mapped back into the form via {@link mapServerErrorsToForm}.
 *
 * This is an internal factory consumed by `createEntityFormHooks` —
 * end users interact with the derived `useCreateForm` hook instead.
 *
 * @param entityHooks - Pre-derived entity hooks containing `useCreate`
 * @returns A `useCreateForm(parentId?, options?)` hook function
 *
 * @example
 * ```ts
 * // Internal usage within createEntityFormHooks:
 * const useCreateForm = createUseCreateForm(entityHooks);
 *
 * // Consumer usage (via deriveFormHooks):
 * const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm(projectId, {
 *   defaultValues: { title: "", status: "open" },
 *   resetOnSuccess: true,
 *   onSuccess: (data) => console.log("Created:", data),
 * });
 * ```
 *
 * @see {@link CreateFormOptions} for available hook options
 * @see {@link CreateFormReturn} for the return value shape
 * @see {@link mapServerErrorsToForm} for server error handling
 */
export function createUseCreateForm(
  entityHooks: AnyEntityHooks,
) {
  return function useCreateForm(
    parentId?: string,
    options?: CreateFormOptions<z.ZodTypeAny>,
  ): CreateFormReturn {
    const [submitError, setSubmitError] = useState<Error | null>(null);

    const createMutation = entityHooks.useCreate(parentId, {
      onSuccess: (data: unknown) => {
        setSubmitError(null);
        options?.onSuccess?.(data);
      },
    });

    const form = useForm({
      defaultValues: (options?.defaultValues ?? {}) as Record<string, unknown>,
      onSubmit: async ({ value }) => {
        try {
          setSubmitError(null);
          await createMutation.mutateAsync(value);
          // Read resetOnSuccess inside onSubmit to avoid stale closure
          if (options?.resetOnSuccess ?? true) {
            form.reset();
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          setSubmitError(err);
          mapServerErrorsToForm(error, form);
          options?.onError?.(err);
        }
      },
    });

    const reset = useCallback(() => {
      form.reset();
      setSubmitError(null);
    }, [form]);

    return {
      form,
      isSubmitting: createMutation.isPending,
      submitError,
      reset,
    };
  };
}
