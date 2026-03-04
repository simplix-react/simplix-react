import type { z } from "zod";
import type { EntityFormHooks } from "./types.js";
/**
 * Assembles form hooks for a single entity based on available CRUD roles.
 *
 * @remarks
 * This is the per-entity factory used internally by {@link deriveEntityFormHooks}.
 * It only creates `useCreateForm` and `useUpdateForm` when the entity has
 * corresponding create/update role operations.
 *
 * @param entityHooks - Pre-derived React Query hooks for the entity
 * @param hasCreate - Whether the entity has a create role operation
 * @param hasUpdate - Whether the entity has an update role operation
 * @returns An object containing available form hooks
 *
 * @see {@link deriveEntityFormHooks} — the public entry point that calls this factory
 * @see {@link EntityFormHooks} for the returned hook set shape
 */
export declare function createEntityFormHooks(entityHooks: Record<string, (...args: unknown[]) => unknown>, hasCreate: boolean, hasUpdate: boolean): EntityFormHooks<z.ZodTypeAny>;
//# sourceMappingURL=create-entity-form-hooks.d.ts.map