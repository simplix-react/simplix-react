/** What reading the object literal of a table declaration found. */
interface LiteralScan {
  /** Index of the closing brace. */
  readonly close: number;
  /** The property names at the literal's top level. */
  readonly keys: ReadonlySet<string>;
  /** The last significant character before the closing brace, outside comments (`{` when empty). */
  readonly last: string;
  /** Index of that character. */
  readonly lastAt: number;
}

/** Index of the character that ends the string literal starting at `from`, or -1 when it never ends. */
function stringEnd(text: string, from: number): number {
  const quote = text[from];
  for (let i = from + 1; i < text.length; i++) {
    if (text[i] === "\\") i++;
    else if (text[i] === quote) return i;
  }
  return -1;
}

/**
 * Reads the object literal opening at `open`: where it closes, which properties it has at its top
 * level, and what its last significant character is. Comments and nested values are skipped, so a
 * brace or a colon inside either is not mistaken for structure.
 */
function scanLiteral(text: string, open: number): LiteralScan | undefined {
  const keys = new Set<string>();
  let depth = 0;
  let key = "";
  let inKey = true;
  let last = "{";
  let lastAt = open;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "/") {
      const end = text.indexOf("\n", i);
      if (end < 0) return undefined;
      i = end;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end < 0) return undefined;
      i = end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const end = stringEnd(text, i);
      if (end < 0) return undefined;
      if (depth === 1 && inKey) key += text.slice(i + 1, end);
      i = end;
      last = c;
      lastAt = end;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") {
      depth++;
      if (depth > 1) {
        last = c;
        lastAt = i;
      }
      continue;
    }
    if (c === "}" || c === "]" || c === ")") {
      depth--;
      if (depth === 0) return { close: i, keys, last, lastAt };
      last = c;
      lastAt = i;
      continue;
    }
    if (/\s/.test(c)) continue;
    if (depth === 1) {
      if (c === ":" && inKey) {
        keys.add(key);
        inKey = false;
      } else if (c === ",") {
        inKey = true;
        key = "";
      } else if (inKey) {
        key += c;
      }
    }
    last = c;
    lastAt = i;
  }
  return undefined;
}

/** What {@link ensureTableEntry} did to the table's source. */
export type TableEntryOutcome =
  | { readonly outcome: "added"; readonly text: string }
  | { readonly outcome: "present" }
  /** The source holds no `export const <name> = { ... }`. */
  | { readonly outcome: "no-table" }
  /** The literal closes on a line that also holds entries, which this does not rewrite. */
  | { readonly outcome: "inline-table" };

/**
 * Adds `key: "<value>"` to the exported object `name` in a source text, before its closing brace,
 * under a doc comment when `doc` is given. A key the object already has is left as it is, with
 * its own value.
 *
 * @param text the source of the file declaring the table
 * @param name the exported object's name
 * @param key the property to add
 * @param value the string the property holds
 * @param doc the text of a one-line doc comment above the entry, or undefined for none
 */
export function ensureTableEntry(text: string, name: string, key: string, value: string, doc?: string): TableEntryOutcome {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(`export\\s+const\\s+${escaped}\\b(?:\\s*:[^=]+)?\\s*=\\s*\\{`).exec(text);
  if (!declaration) return { outcome: "no-table" };
  const open = declaration.index + declaration[0].length - 1;
  const scan = scanLiteral(text, open);
  if (!scan) return { outcome: "no-table" };
  if (scan.keys.has(key)) return { outcome: "present" };

  const lineStart = text.lastIndexOf("\n", scan.close - 1) + 1;
  if (lineStart <= open || text.slice(lineStart, scan.close).trim() !== "") return { outcome: "inline-table" };

  const indent = `${/^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? ""}  `;
  const entry = `${doc === undefined ? "" : `${indent}/** ${doc} */\n`}${indent}${key}: ${JSON.stringify(value)},\n`;
  // The property before the new one gets the comma it lacks, after its value rather than after a trailing comment.
  const needsComma = scan.last !== "," && scan.last !== "{";
  const before = needsComma ? `${text.slice(0, scan.lastAt + 1)},${text.slice(scan.lastAt + 1, lineStart)}` : text.slice(0, lineStart);
  return { outcome: "added", text: `${before}${entry}${text.slice(lineStart)}` };
}

/** The index of the first top-level comma at or after `from`, or `limit` when none comes before it. */
function nextTopLevelComma(text: string, from: number, limit: number): number {
  let depth = 0;
  for (let i = from; i < limit; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = stringEnd(text, i);
      if (end < 0) return limit;
      i = end;
    } else if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === "," && depth === 0) return i;
  }
  return limit;
}

/**
 * The properties of the object `name` declared in a source text whose value is a plain string
 * literal, by property name. A property holding anything else (a nested object, an expression, a
 * template with a substitution) is left out.
 *
 * @param text the source of the file declaring the object
 * @param name the constant's name, exported or not
 * @returns the string properties, or undefined when the source declares no object of that name
 */
export function tableStrings(text: string, name: string): ReadonlyMap<string, string> | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(`(?:export\\s+)?const\\s+${escaped}\\b(?:\\s*:[^=]+)?\\s*=\\s*\\{`).exec(text);
  if (!declaration) return undefined;
  const open = declaration.index + declaration[0].length - 1;
  const scan = scanLiteral(text, open);
  if (!scan) return undefined;
  const strings = new Map<string, string>();
  let at = open + 1;
  while (at < scan.close) {
    while (at < scan.close && /[\s,]/.test(text[at])) at++;
    if (text.startsWith("//", at)) {
      const end = text.indexOf("\n", at);
      at = end < 0 ? scan.close : end + 1;
      continue;
    }
    if (text.startsWith("/*", at)) {
      const end = text.indexOf("*/", at + 2);
      at = end < 0 ? scan.close : end + 2;
      continue;
    }
    if (at >= scan.close) break;
    let key: string;
    if (text[at] === '"' || text[at] === "'") {
      const end = stringEnd(text, at);
      if (end < 0) break;
      key = text.slice(at + 1, end);
      at = end + 1;
    } else {
      const word = /^[A-Za-z_$][\w$]*/.exec(text.slice(at, scan.close))?.[0];
      if (word === undefined) {
        at = nextTopLevelComma(text, at, scan.close) + 1;
        continue;
      }
      key = word;
      at += word.length;
    }
    while (at < scan.close && /\s/.test(text[at])) at++;
    if (text[at] !== ":") {
      at = nextTopLevelComma(text, at, scan.close) + 1;
      continue;
    }
    at++;
    while (at < scan.close && /\s/.test(text[at])) at++;
    const quote = text[at];
    if (quote === '"' || quote === "'" || quote === "`") {
      const end = stringEnd(text, at);
      const value = end < 0 ? undefined : text.slice(at + 1, end);
      if (value !== undefined && !(quote === "`" && value.includes("${")) && /^\s*(,|\}|$)/.test(text.slice(end + 1, scan.close + 1))) strings.set(key, value);
    }
    at = nextTopLevelComma(text, at, scan.close) + 1;
  }
  return strings;
}
