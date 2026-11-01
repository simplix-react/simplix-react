import type { CrudEntityConfig } from "../config/types.js";

/** The roles that read a list's figures, which SimpliX Meta states and a crud map rarely does. */
const FIGURE_ROLES = ["statusCounts", "aggregates"] as const;

/**
 * The hook of each role a screen is scaffolded from.
 *
 * <p>A hand-written crud map entry states an intent SimpliX Meta cannot, so it wins for every role
 * it names. A figure role it leaves out is taken from Meta: a map written before the entity gained
 * its status counts or aggregates would otherwise drop the figures the contract declares.
 *
 * @param crudConfig the entity's entry in the domain's crud map, when it has one
 * @param metaRoles the roles SimpliX Meta resolves for the entity, when it is on Meta
 */
export function scaffoldRoles(crudConfig: CrudEntityConfig | null | undefined, metaRoles: CrudEntityConfig | null | undefined): CrudEntityConfig | null {
  if (!crudConfig) return metaRoles ?? null;
  const figures: CrudEntityConfig = {};
  for (const role of FIGURE_ROLES) {
    const hook = metaRoles?.[role];
    if (crudConfig[role] === undefined && hook !== undefined) figures[role] = hook;
  }
  return { ...figures, ...crudConfig };
}
