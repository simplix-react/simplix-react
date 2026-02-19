import type { AnyEntityDef, ApiContractConfig, EntityOperationDef } from "@simplix-react/contract";
import { resolveRole } from "@simplix-react/contract";
import type { EntityHooks } from "@simplix-react/react";
import type { EntityFormHooks } from "./types.js";
import { createEntityFormHooks } from "./create-entity-form-hooks.js";

/**
 * Derives TanStack Form hooks from an API contract and its derived React Query hooks.
 *
 * For each entity in the contract, produces `useCreateForm` and/or `useUpdateForm` hooks
 * based on the presence of `create` and `update` role operations. These hooks wire
 * TanStack Form to the entity's mutations with automatic dirty-field extraction
 * and server error mapping.
 *
 * @param contract - The API contract produced by `defineApi()` from `@simplix-react/contract`
 * @param hooks - The React Query hooks produced by `deriveHooks()` from `@simplix-react/react`
 * @returns An object keyed by entity name, each containing form hooks
 *
 * @example
 * ```ts
 * import { deriveFormHooks } from "@simplix-react/form";
 * import { inventoryApi } from "./contract";
 * import { inventoryHooks } from "./hooks";
 *
 * export const inventoryFormHooks = deriveFormHooks(inventoryApi, inventoryHooks);
 *
 * // Use in components
 * function CreateProductForm() {
 *   const { form, isSubmitting } = inventoryFormHooks.product.useCreateForm();
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
    [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]>;
  },
): DerivedFormHooksResult<TEntities> {
  const { config } = contract;
  const result: Record<string, unknown> = {};

  for (const entityName of Object.keys(config.entities)) {
    const entity = config.entities[entityName];
    const entityHooks = hooks[entityName] as Record<string, (...args: unknown[]) => unknown>;

    // Check which CRUD roles exist in the entity's operations
    let hasCreate = false;
    let hasUpdate = false;

    for (const [opName, op] of Object.entries(entity.operations) as [string, EntityOperationDef][]) {
      const role = resolveRole(opName, op);
      if (role === "create") hasCreate = true;
      if (role === "update") hasUpdate = true;
    }

    result[entityName] = createEntityFormHooks(entityHooks, hasCreate, hasUpdate);
  }

  return result as DerivedFormHooksResult<TEntities>;
}

/** Mapped type that produces per-entity {@link EntityFormHooks} from the contract's entity map. */
export type DerivedFormHooksResult<TEntities extends Record<string, AnyEntityDef>> = {
  [K in keyof TEntities]: EntityFormHooks<TEntities[K]["schema"]>;
};
