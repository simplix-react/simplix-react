import type { z } from "zod";
import type { AnyEntityHooks, EntityFormHooks } from "./types.js";
import { createUseCreateForm } from "./hooks/use-create-form.js";
import { createUseUpdateForm } from "./hooks/use-update-form.js";

/**
 * Assembles the `useCreateForm` and `useUpdateForm` hooks for a single entity.
 *
 * @remarks
 * This is the per-entity factory used internally by {@link deriveFormHooks}.
 * It delegates to {@link createUseCreateForm} and {@link createUseUpdateForm}
 * to produce the hook pair, then bundles them into an {@link EntityFormHooks}
 * object.
 *
 * @param entityHooks - Pre-derived React Query hooks for the entity
 *   (must include `useCreate`, `useUpdate`, and `useGet`)
 * @returns An object containing `useCreateForm` and `useUpdateForm` hooks
 *
 * @example
 * ```ts
 * // Internal usage within deriveFormHooks:
 * const taskFormHooks = createEntityFormHooks(hooks.task);
 * // taskFormHooks.useCreateForm(parentId?, options?)
 * // taskFormHooks.useUpdateForm(entityId, options?)
 * ```
 *
 * @see {@link deriveFormHooks} — the public entry point that calls this factory
 * @see {@link EntityFormHooks} for the returned hook set shape
 */
export function createEntityFormHooks(
  entityHooks: AnyEntityHooks,
): EntityFormHooks<z.ZodTypeAny, z.ZodTypeAny> {
  return {
    useCreateForm: createUseCreateForm(entityHooks),
    useUpdateForm: createUseUpdateForm(entityHooks),
  };
}
