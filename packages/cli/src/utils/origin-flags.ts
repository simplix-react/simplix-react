/**
 * The flags of an origin that say which screen it lays down. Every other flag is one of the
 * screen's design decisions (a status badge, a card title, a menu group), and every file of the
 * screen is rendered with the same decisions.
 */
const IDENTITY_FLAGS: readonly string[] = ["--module", "--output", "--app"];

/** An origin split into the words before its flags and the flags, in the order they were recorded. */
interface ParsedOrigin {
  readonly positionals: readonly string[];
  /** A flag and its value; the value is undefined for a flag that takes none (`--view-toggle`). */
  readonly flags: readonly (readonly [string, string | undefined])[];
}

function parseOrigin(origin: string): ParsedOrigin {
  const words = origin.split(/\s+/).filter(Boolean);
  const first = words.findIndex((word) => word.startsWith("--"));
  const positionals = first < 0 ? words : words.slice(0, first);
  const flags: (readonly [string, string | undefined])[] = [];
  for (let at = first < 0 ? words.length : first; at < words.length; at += 1) {
    const next = words[at + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.push([words[at], next]);
      at += 1;
    } else flags.push([words[at], undefined]);
  }
  return { positionals, flags };
}

function renderParsed(parsed: ParsedOrigin): string {
  return [...parsed.positionals, ...parsed.flags.flatMap(([flag, value]) => (value === undefined ? [flag] : [flag, value]))].join(" ");
}

/** What names the screen an origin lays down: the command, its words and the flags that place it. */
export function screenOfOrigin(origin: string): string {
  const parsed = parseOrigin(origin);
  const placing = parsed.flags.filter(([flag]) => IDENTITY_FLAGS.includes(flag)).sort(([a], [b]) => a.localeCompare(b));
  return renderParsed({ positionals: parsed.positionals, flags: placing });
}

/** One decision flag the files of a screen record differently. */
export interface OriginDisagreement {
  /** The screen, as its origin names it without decisions (`scaffold plan --module admin/billing`). */
  readonly screen: string;
  readonly flag: string;
  /**
   * `missing`: some files record the flag and others record none; the render takes the flag.
   * `conflict`: files record different values; the render cannot take them all.
   */
  readonly kind: "missing" | "conflict";
  /** Each recorded value with the files recording it; `value` is null for the files that record no such flag. */
  readonly recorded: readonly { readonly value: string | null; readonly files: readonly string[] }[];
  /** The value the render takes: the one most files record, then the first in alphabetical order. */
  readonly chosen: string | undefined;
}

/** The origins of a project's generated files, made to agree per screen. */
export interface OriginUnification {
  /** The origin to render, by the origin text a file records; a text absent from the map renders as it is. */
  readonly unified: ReadonlyMap<string, string>;
  readonly disagreements: readonly OriginDisagreement[];
}

/**
 * Makes the origins recorded by the files of one screen agree before any of them is rendered.
 *
 * <p>A scaffold stamps every file of a screen with one command, but a design decision taken later
 * (`--status-badge`) reaches only the files written after it: the rest keep the older command.
 * Rendering each recorded command on its own writes the screen once with the decision and once
 * without it, and the later render undoes the earlier one. The screen is rendered once instead,
 * with every decision any of its files records. A decision recorded with two different values
 * cannot be rendered both ways, so the value most files record is taken and the disagreement is
 * reported for a person to settle.
 *
 * @param recorded each generated file's path with the origin it records
 */
export function unifyOrigins(recorded: Iterable<{ readonly path: string; readonly origin: string }>): OriginUnification {
  const screens = new Map<string, { path: string; origin: string }[]>();
  for (const one of recorded) {
    const key = screenOfOrigin(one.origin);
    screens.set(key, [...(screens.get(key) ?? []), one]);
  }
  const unified = new Map<string, string>();
  const disagreements: OriginDisagreement[] = [];
  for (const [screen, files] of [...screens].sort(([a], [b]) => a.localeCompare(b))) {
    const origins = [...new Set(files.map((one) => one.origin))].sort();
    if (origins.length === 1) continue;
    // The richest recorded origin keeps its word order; flags only other origins record follow it.
    const parsed = origins.map((origin) => ({ origin, parsed: parseOrigin(origin) }));
    const richest = [...parsed].sort((a, b) => b.parsed.flags.length - a.parsed.flags.length)[0].parsed;
    const names = [...new Set([...richest.flags, ...parsed.flatMap((one) => one.parsed.flags)].map(([flag]) => flag))];
    const chosen = new Map<string, string | undefined>();
    for (const flag of names) {
      if (IDENTITY_FLAGS.includes(flag)) {
        chosen.set(flag, richest.flags.find(([name]) => name === flag)?.[1]);
        continue;
      }
      const byValue = new Map<string | null, string[]>();
      for (const file of files) {
        const own = parseOrigin(file.origin).flags.find(([name]) => name === flag);
        const value = own === undefined ? null : (own[1] ?? "");
        byValue.set(value, [...(byValue.get(value) ?? []), file.path]);
      }
      const ranked = [...byValue].filter(([value]) => value !== null).sort(([va, a], [vb, b]) => b.length - a.length || String(va).localeCompare(String(vb)));
      const winner = ranked[0][0] as string;
      chosen.set(flag, winner === "" ? undefined : winner);
      if (byValue.size > 1) {
        disagreements.push({
          screen,
          flag,
          kind: ranked.length > 1 ? "conflict" : "missing",
          recorded: [...byValue].map(([value, paths]) => ({ value, files: [...paths].sort() })).sort((a, b) => String(a.value).localeCompare(String(b.value))),
          chosen: winner === "" ? undefined : winner,
        });
      }
    }
    const merged = renderParsed({ positionals: richest.positionals, flags: names.map((flag) => [flag, chosen.get(flag)] as const) });
    for (const origin of origins) unified.set(origin, merged);
  }
  return { unified, disagreements };
}

/** One sentence per disagreement, for a report or an error. */
export function describeDisagreement(one: OriginDisagreement): string {
  const spell = (value: string | null) => (value === null ? "no such flag" : value === "" ? one.flag : `${one.flag} ${value}`);
  const parts = one.recorded.map((entry) => `${spell(entry.value)} in ${entry.files.length} file(s) (${entry.files.slice(0, 3).join(", ")}${entry.files.length > 3 ? ", ..." : ""})`);
  const verdict =
    one.kind === "conflict"
      ? `a regeneration is refused until one value is recorded in every file with \`simplix generated --origin "<command>" <path...>\``
      : `a regeneration renders every file of the screen with ${one.chosen === undefined ? one.flag : `${one.flag} ${one.chosen}`}`;
  return `${one.screen}: files disagree on ${one.flag}: ${parts.join("; ")}; ${verdict}`;
}
