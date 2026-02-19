import type { z } from "zod";
import type { EntityFormHooks } from "./types.js";
import { createUseCreateForm } from "./hooks/use-create-form.js";
import { createUseUpdateForm } from "./hooks/use-update-form.js";

/**
 * Assembles form hooks for a single entity based on available CRUD roles.
 *
 * @remarks
 * This is the per-entity factory used internally by {@link deriveFormHooks}.
 * It only creates `useCreateForm` and `useUpdateForm` when the entity has
 * corresponding create/update role operations.
 *
 * @param entityHooks - Pre-derived React Query hooks for the entity
 * @param hasCreate - Whether the entity has a create role operation
 * @param hasUpdate - Whether the entity has an update role operation
 * @returns An object containing available form hooks
 *
 * @see {@link deriveFormHooks} — the public entry point that calls this factory
 * @see {@link EntityFormHooks} for the returned hook set shape
 */
export function createEntityFormHooks(
  entityHooks: Record<string, (...args: unknown[]) => unknown>,
  hasCreate: boolean,
  hasUpdate: boolean,
): EntityFormHooks<z.ZodTypeAny> {
  const formHooks: EntityFormHooks<z.ZodTypeAny> = {};

  // Build a compatible entity hooks shape for the form hook creators
  const compatHooks = {
    useCreate: entityHooks.useCreate as ((...args: unknown[]) => unknown) | undefined,
    useUpdate: entityHooks.useUpdate as ((...args: unknown[]) => unknown) | undefined,
    useGet: entityHooks.useGet as ((...args: unknown[]) => unknown) | undefined,
  };

  if (hasCreate && compatHooks.useCreate) {
    formHooks.useCreateForm = createUseCreateForm(compatHooks as never);
  }

  if (hasUpdate && compatHooks.useUpdate && compatHooks.useGet) {
    formHooks.useUpdateForm = createUseUpdateForm(compatHooks as never);
  }

  return formHooks;
}
