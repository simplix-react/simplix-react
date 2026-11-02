/** A field as the story fixtures read it: its name, its contract kind, and its options. */
export interface FixtureField {
  readonly name: string;
  readonly contractKind?: string;
  readonly options?: readonly string[];
  readonly nameField?: string;
  readonly tsType?: string;
  /** The plain field a multilingual map fills, set on the map's own field. */
  readonly baseFieldName?: string | null;
}

/**
 * Sample rows for a generated story, one value per field drawn from its contract kind.
 *
 * <p>The values say only which field they belong to and which row they sit in, so a frame built on
 * them shows the screen's composition and nothing that reads as real data; a story that needs
 * believable rows is customised after it is generated.
 *
 * @param fields the fields the list and detail draw
 * @param rowIdField the field that identifies a row
 * @param entityKebab the entity's kebab name, the prefix of each row's id
 * @param count how many rows
 * @param locales the languages a multilingual field holds a value in, every one the project ships,
 *   so the frame draws a translated record as the screen draws one
 */
export function fixtureRows(
  fields: readonly FixtureField[],
  rowIdField: string,
  entityKebab: string,
  count = 3,
  locales: readonly string[] = [],
): Record<string, unknown>[] {
  const byName = new Map<string, FixtureField>();
  for (const f of fields) if (!byName.has(f.name)) byName.set(f.name, f);
  return Array.from({ length: count }, (_, at) => {
    const n = at + 1;
    const row: Record<string, unknown> = {};
    for (const f of byName.values()) {
      if (f.name === rowIdField) continue;
      row[f.name] =
        f.contractKind === "i18nText" && f.baseFieldName && locales.length > 0
          ? Object.fromEntries(locales.map((locale) => [locale, `${f.baseFieldName} ${n}`]))
          : sampleValue(f, n);
      if (f.contractKind === "reference" && f.nameField && !byName.has(f.nameField)) setPath(row, f.nameField, `${f.nameField.split(".").pop()} ${n}`);
    }
    row[rowIdField] = byName.get(rowIdField)?.tsType === "number" ? n : `${entityKebab}-${n}`;
    return row;
  });
}

/**
 * Writes a value at a dotted path, creating the nested records on the way: a reference named by
 * `user.username` is a row whose `user` is a record, never a row with a key spelled `user.username`
 * that no reader of the contract resolves.
 */
function setPath(row: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let at = row;
  for (const part of parts.slice(0, -1)) {
    const next = at[part];
    if (typeof next === "object" && next !== null) {
      at = next as Record<string, unknown>;
      continue;
    }
    const created: Record<string, unknown> = {};
    at[part] = created;
    at = created;
  }
  at[parts[parts.length - 1]!] = value;
}

function sampleValue(f: FixtureField, n: number): unknown {
  const day = String(n).padStart(2, "0");
  switch (f.contractKind) {
    case "enum":
      return f.options && f.options.length > 0 ? f.options[(n - 1) % f.options.length] : `VALUE_${n}`;
    case "boolean":
      return n % 2 === 1;
    case "instant":
      return `2026-01-${day}T09:00:00Z`;
    case "date":
      return `2026-01-${day}`;
    case "time":
      return `09:${day}`;
    case "number":
      return n * 10;
    case "reference":
      return `${f.name}-${n}`;
    case "email":
      return `${f.name.toLowerCase()}${n}@example.test`;
    // A structured value is an object, so the frame draws what the screen draws for one.
    case "json":
      return { id: `${f.name}-${n}`, sequence: n };
    default:
      return f.tsType === "number" ? n * 10 : `${f.name} ${n}`;
  }
}
