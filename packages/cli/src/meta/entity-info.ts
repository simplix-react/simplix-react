import type { MetaScaffoldSource } from "./scaffold-source.js";
import { withUnmaskedFlagged } from "./personal-data.js";

/** What the backend offers a screen over one entity, as SimpliX Meta states it. */
export interface EntityInfo {
  readonly entity: string;
  readonly tag: string;
  readonly domain: string;
  /** Roles the entity's operations take (`search`, `get`, `statusCounts`, `counts`, `export`, an action's name), each with its hook. */
  readonly roles: Readonly<Record<string, string>>;
  readonly list: { readonly available: boolean; readonly access?: string };
  readonly defaultSort?: { readonly field: string; readonly direction: string };
  readonly keywordSearch: boolean;
  /** The fields a status-count read accepts: figure tiles per value. */
  readonly statusCounts: readonly string[];
  /** The sums and counts an aggregates read answers with. */
  readonly aggregates: readonly { readonly field: string; readonly op: string }[];
  /** The time range: the field the list is read by in time, and the counts read beside it. Absent unless both exist. */
  readonly timeRange?: { readonly field: string; readonly counts: string };
  readonly export: boolean;
  readonly create: boolean;
  readonly update: boolean;
  readonly delete: boolean;
  /** Searchable fields and the control each offers. */
  readonly filters: readonly { readonly field: string; readonly control: string }[];
  /** Fields the record carries beside a masked form of them; a generated screen does not draw them. */
  readonly unmasked: readonly string[];
  /** Roles named by actions beyond the standard reads and writes: what a lifecycle screen can drive. */
  readonly actions: readonly string[];
}

const STANDARD_ROLES = new Set([
  "list", "search", "simpleSearch", "get", "getAll", "create", "update", "delete", "tree", "subtree",
  "statusCounts", "aggregates", "counts", "export", "multiUpdate", "batchUpdate", "batchDelete", "order",
]);

/**
 * Reads what a screen over an entity can offer from the scaffold source SimpliX Meta gave it.
 *
 * @param source the entity as the scaffolder reads it
 * @param maskedSuffix the project's `scaffold.maskedSuffix`, if any
 */
export function describeEntity(source: MetaScaffoldSource, maskedSuffix: string | undefined): EntityInfo {
  const roles = source.roles as Readonly<Record<string, string>>;
  const flagged = withUnmaskedFlagged(source.detailFields ?? source.fields, maskedSuffix);
  return {
    entity: source.entity,
    tag: source.tag,
    domain: source.domain,
    roles,
    list: { available: source.operations.hasList || roles.search !== undefined, ...(source.listAccess ? { access: accessText(source.listAccess) } : {}) },
    ...(source.defaultSort ? { defaultSort: { field: source.defaultSort.field, direction: source.defaultSort.direction ?? "desc" } } : {}),
    keywordSearch: source.keywordSearch,
    statusCounts: source.statusCounts ?? [],
    aggregates: source.aggregates ?? [],
    ...(source.timeBuckets ? { timeRange: { field: source.timeBuckets.field, counts: source.timeBuckets.fetch } } : {}),
    export: roles.export !== undefined,
    create: source.operations.hasCreate,
    update: source.operations.hasUpdate,
    delete: source.operations.hasDelete,
    filters: source.filters.map((one) => ({ field: one.field, control: one.component })),
    unmasked: flagged.filter((one) => one.isUnmasked).map((one) => one.name),
    actions: Object.keys(roles).filter((role) => !STANDARD_ROLES.has(role)),
  };
}

function accessText(access: NonNullable<MetaScaffoldSource["listAccess"]>): string {
  return access.kind === "permission" ? `${access.group}:${access.action}` : access.kind;
}

/** The report a person reads: each capability a rich screen asks for, with what Meta says. */
export function formatEntityInfo(info: EntityInfo): string {
  const yes = (on: boolean, text: string) => (on ? text : "none");
  const lines = [
    `${info.entity} (${info.tag}, domain ${info.domain})`,
    `  list            ${info.list.available ? `yes${info.list.access ? `, requires ${info.list.access}` : ""}` : "none"}`,
    `  default sort    ${info.defaultSort ? `${info.defaultSort.field} ${info.defaultSort.direction}` : "none (the server's order)"}`,
    `  keyword search  ${yes(info.keywordSearch, "yes (the list can draw a search box)")}`,
    `  status counts   ${yes(info.statusCounts.length > 0, `fields ${info.statusCounts.join(", ")} (a figure tile per value)`)}`,
    `  aggregates      ${yes(info.aggregates.length > 0, info.aggregates.map((one) => `${one.op}(${one.field})`).join(", "))}`,
    `  time range      ${info.timeRange ? `field ${info.timeRange.field}, counts read ${info.timeRange.counts}` : "none (needs a search operation naming a time axis and GET <base>/counts)"}`,
    `  export          ${yes(info.export, "yes")}`,
    `  create/update/delete  ${[info.create && "create", info.update && "update", info.delete && "delete"].filter(Boolean).join(", ") || "none (read-only)"}`,
    `  actions         ${info.actions.length > 0 ? info.actions.join(", ") : "none"}`,
    `  filters         ${info.filters.length > 0 ? info.filters.map((one) => `${one.field} (${one.control})`).join(", ") : "none"}`,
  ];
  if (info.unmasked.length > 0) {
    lines.push(`  masked twins    ${info.unmasked.join(", ")} (each has a masked form beside it; a generated screen draws that one)`);
  }
  return lines.join("\n");
}
