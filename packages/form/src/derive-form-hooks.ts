import type { z } from "zod";
import type { ApiContractConfig } from "@simplix-react/contract";
import type { EntityHooks } from "@simplix-react/react";
import type { AnyEntityDef, EntityFormHooks } from "./types.js";
import { createEntityFormHooks } from "./create-entity-form-hooks.js";

/**
 * Derives TanStack Form hooks from an API contract and its derived React Query hooks.
 *
 * For each entity in the contract, produces `useCreateForm` and `useUpdateForm` hooks
 * that wire TanStack Form to the entity's create/update mutations with automatic
 * dirty-field extraction and server error mapping.
 *
 * @param contract - The API contract produced by `defineApi()` from `@simplix-react/contract`
 * @param hooks - The React Query hooks produced by `deriveHooks()` from `@simplix-react/react`
 * @returns An object keyed by entity name, each containing form hooks
 *
 * @example
 * ```ts
 * import { deriveFormHooks } from "@simplix-react/form";
 * import { projectApi } from "./contract";
 * import { projectHooks } from "./hooks";
 *
 * export const projectFormHooks = deriveFormHooks(projectApi, projectHooks);
 *
 * // Use in components
 * function CreateTaskForm() {
 *   const { form, isSubmitting } = projectFormHooks.task.useCreateForm(projectId);
 *   return <form onSubmit={e => { e.preventDefault(); form.handleSubmit(); }}>...</form>;
 * }
 * ```
 */
export function deriveFormHooks<
  TEntities extends Record<string, AnyEntityDef>,
>(
  contract: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: ApiContractConfig<TEntities, any>;
  },
  hooks: {
    [K in keyof TEntities]: EntityHooks<
      TEntities[K]["schema"],
      TEntities[K]["createSchema"],
      TEntities[K]["updateSchema"]
    >;
  },
): DerivedFormHooksResult<TEntities> {
  const { config } = contract;
  const result: Record<string, unknown> = {};

  for (const entityName of Object.keys(config.entities)) {
    const entityHooks = hooks[entityName] as EntityHooks<
      z.ZodTypeAny,
      z.ZodTypeAny,
      z.ZodTypeAny
    >;

    result[entityName] = createEntityFormHooks(entityHooks);
  }

  return result as DerivedFormHooksResult<TEntities>;
}

/** Mapped type that produces per-entity {@link EntityFormHooks} from the contract's entity map. */
type DerivedFormHooksResult<TEntities extends Record<string, AnyEntityDef>> = {
  [K in keyof TEntities]: EntityFormHooks<
    TEntities[K]["schema"],
    TEntities[K]["createSchema"]
  >;
};
