/** A field as the templates draw it: its name and contract kind, and a money field's currency. */
export interface FigureField {
  readonly name: string;
  readonly contractKind?: string;
  readonly enumTypeName?: string;
  readonly options?: readonly string[];
  readonly money?: { readonly currency: string; readonly scale: number };
  /** A ledger amount, drawn signed. */
  readonly signed?: boolean;
  /** The status tone of each value, as SimpliX Meta declares it. */
  readonly tones?: Readonly<Record<string, string>>;
}

/** What the page templates draw as a generated list page's default figure tiles. */
export interface FigureTiles {
  /** A tile per value of one enum, counted by the status-counts read. */
  readonly status?: {
    readonly hook: string;
    readonly field: string;
    readonly enumName: string;
    readonly options: readonly string[];
    /** The tone each counted value's tile is drawn in, from the field's declared tones. */
    readonly tones?: Readonly<Record<string, string>>;
  };
  /** A tile per sum or count of the aggregates read, in its order. */
  readonly aggregates?: {
    readonly hook: string;
    readonly figures: readonly { readonly field: string; readonly op: "sum" | "count"; readonly kind: string; readonly money?: FigureField["money"]; readonly signed?: boolean; readonly isRowCount: boolean }[];
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
      ? { hook: input.hooks.statusCounts, field: statusField.name, enumName: statusField.enumTypeName, options: [...(statusField.options ?? [])], ...(statusField.tones ? { tones: { ...statusField.tones } } : {}) }
      : undefined;
  const figures = (input.aggregates ?? []).flatMap((one) => {
    if (one.op !== "sum" && one.op !== "count") return [];
    const isRowCount = one.op === "count" && one.field === input.rowIdField;
    const field = byName.get(one.field);
    if (!isRowCount && !field) return [];
    if (one.op === "sum" && !["number", "money", "credits", "bytes", "duration"].includes(field?.contractKind ?? "")) return [];
    return [{ field: one.field, op: one.op as "sum" | "count", kind: isRowCount ? "number" : one.op === "count" ? "number" : (field?.contractKind ?? "number"), ...(one.op === "sum" && field?.money ? { money: field.money } : {}), ...(one.op === "sum" && field?.signed ? { signed: true } : {}), isRowCount }];
  });
  const aggregates = figures.length > 0 && input.hooks.aggregates ? { hook: input.hooks.aggregates, figures } : undefined;
  if (!status && !aggregates) return undefined;
  return { ...(status ? { status } : {}), ...(aggregates ? { aggregates } : {}) };
}

/** A list filter as the templates render it: its kind, field, and for a choice its enum and values. */
export interface TileFilterInfo {
  kind: "choice" | "toggle" | "dateRange" | "number" | "reference" | "text";
  field: string;
  enumTypeName?: string;
  options?: string[];
}

/**
 * The list's filters with one for every field a figure tile narrows.
 *
 * <p>A status tile writes its value as the list's own `<field>.in` filter, so the filter bar has to
 * offer that field: otherwise a pressed tile narrows the rows while the bar shows no active value
 * and cannot clear it. A field the contract already filters by is left as it is.
 *
 * @param filters the filters the contract's searchable fields give the list
 * @param tiles the figure tiles the page draws
 */
export function withTileFilters<F extends TileFilterInfo>(filters: readonly F[], tiles: FigureTiles | undefined): (F | TileFilterInfo)[] {
  const status = tiles?.status;
  if (!status || filters.some((filter) => filter.field === status.field)) return [...filters];
  return [...filters, { kind: "choice", field: status.field, enumTypeName: status.enumName, options: [...status.options] }];
}
