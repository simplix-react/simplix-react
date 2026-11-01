/** A field as the templates draw it: its name and contract kind, and a money field's currency. */
export interface FigureField {
  readonly name: string;
  readonly contractKind?: string;
  readonly enumTypeName?: string;
  readonly options?: readonly string[];
  readonly money?: { readonly currency: string; readonly scale: number };
}

/** What the page templates draw as a generated list page's default figure tiles. */
export interface FigureTiles {
  /** A tile per value of one enum, counted by the status-counts read. */
  readonly status?: {
    readonly hook: string;
    readonly field: string;
    readonly enumName: string;
    readonly options: readonly string[];
  };
  /** A tile per sum or count of the aggregates read, in its order. */
  readonly aggregates?: {
    readonly hook: string;
    readonly figures: readonly { readonly field: string; readonly op: "sum" | "count"; readonly kind: string; readonly money?: FigureField["money"]; readonly isRowCount: boolean }[];
  };
}

/** What {@link figureTilesOf} reads. */
export interface FigureTilesInput {
  /** The fields the entity's status counts accept, as its Meta states them. */
  readonly statusCounts?: readonly string[];
  /** The figures the entity's aggregates read answers with. */
  readonly aggregates?: readonly { readonly field: string; readonly op: string }[];
  /** The hook of each role the domain generated (`statusCounts`, `aggregates`), with its `use` prefix. */
  readonly hooks: { readonly statusCounts?: string | null; readonly aggregates?: string | null };
  /** The fields the list and the detail draw, with their contract kinds. */
  readonly fields: readonly FigureField[];
  /** The field a row is addressed by; a count over it counts rows. */
  readonly rowIdField: string;
}

/**
 * The default figure tiles a generated list page draws, from what the entity's SimpliX Meta says it
 * counts and sums: a tile per value of the first counted enum, and a tile per sum or row count of
 * its aggregates. Nothing is guessed: no Meta key, no hook, or a field the list does not know means
 * no tiles of that kind. A distinct count, a minimum and a maximum are left to the screen, which
 * knows what they mean.
 *
 * @param input what Meta states and what the domain generated
 * @returns the tiles to draw, or `undefined` for none
 */
export function figureTilesOf(input: FigureTilesInput): FigureTiles | undefined {
  const byName = new Map(input.fields.map((field) => [field.name, field]));
  const statusField = input.statusCounts?.map((name) => byName.get(name)).find((field) => field?.contractKind === "enum" && (field.options?.length ?? 0) > 0);
  const status =
    statusField && input.hooks.statusCounts && statusField.enumTypeName
      ? { hook: input.hooks.statusCounts, field: statusField.name, enumName: statusField.enumTypeName, options: [...(statusField.options ?? [])] }
      : undefined;
  const figures = (input.aggregates ?? []).flatMap((one) => {
    if (one.op !== "sum" && one.op !== "count") return [];
    const isRowCount = one.op === "count" && one.field === input.rowIdField;
    const field = byName.get(one.field);
    if (!isRowCount && !field) return [];
    if (one.op === "sum" && !["number", "money", "credits", "bytes", "duration"].includes(field?.contractKind ?? "")) return [];
    return [{ field: one.field, op: one.op as "sum" | "count", kind: isRowCount ? "number" : one.op === "count" ? "number" : (field?.contractKind ?? "number"), ...(one.op === "sum" && field?.money ? { money: field.money } : {}), isRowCount }];
  });
  const aggregates = figures.length > 0 && input.hooks.aggregates ? { hook: input.hooks.aggregates, figures } : undefined;
  if (!status && !aggregates) return undefined;
  return { ...(status ? { status } : {}), ...(aggregates ? { aggregates } : {}) };
}
