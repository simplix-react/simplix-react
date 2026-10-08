import { dirname, join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { pathExists, readJsonFile } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Package Rules:
 * - All packages must have "exports" field in package.json
 * - tsup.config must exist and match exports
 * - React packages take react (and react-dom) as a peer dependency, not a dependency
 * - Every entry declares its source, and its types point at that source, so tsc and editors read
 *   a package without building it
 * - tsup emits no declarations
 */
export async function validatePackageRules(
  pkgDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const pkgJsonPath = join(pkgDir, "package.json");
  if (!(await pathExists(pkgJsonPath))) return;

  const pkg = await readJsonFile<Record<string, unknown>>(pkgJsonPath);

  // Check "exports" field
  if (pkg["exports"]) {
    result.passes.push('Has "exports" field');
  } else {
    result.warnings.push('Missing "exports" field in package.json');
  }

  // Check tsup.config exists
  const tsupTs = join(pkgDir, "tsup.config.ts");
  const tsupJs = join(pkgDir, "tsup.config.js");
  if ((await pathExists(tsupTs)) || (await pathExists(tsupJs))) {
    result.passes.push("tsup.config exists");
  } else {
    result.warnings.push("Missing tsup.config.ts or tsup.config.js");
  }

  // React belongs to the app: a shared package declares it as a peer and keeps it for its own
  // builds and tests only, so a consumer never ends up with a second copy.
  let text = await readFile(pkgJsonPath, "utf-8");
  const original = text;
  const deps = (pkg["dependencies"] ?? {}) as Record<string, string>;
  const devDeps = (pkg["devDependencies"] ?? {}) as Record<string, string>;
  const peerDeps = (pkg["peerDependencies"] ?? {}) as Record<string, string>;

  const moving = REACT_PACKAGES.filter((name) => name in deps);
  const needsPeer = REACT_PACKAGES.filter(
    (name) => (name in deps || (name === "react" && name in devDeps)) && !(name in peerDeps),
  );
  if (moving.length > 0 || needsPeer.length > 0) {
    if (options?.fix) {
      for (const name of moving) {
        text = removeField(text, "dependencies", name);
        if (!(name in devDeps)) text = setField(text, "devDependencies", name, deps[name]);
      }
      for (const name of needsPeer) {
        text = setField(text, "peerDependencies", name, REACT_PEER_RANGE);
      }
      if (moving.length > 0) {
        result.passes.push(`Auto-fixed: moved ${moving.join(", ")} to peerDependencies and devDependencies`);
      } else {
        result.passes.push(`Auto-fixed: added ${needsPeer.join(", ")} to peerDependencies`);
      }
    } else if (moving.length > 0) {
      result.warnings.push(
        `${moving.join(", ")} in dependencies; a shared package takes it as a peer dependency`,
      );
    } else {
      result.warnings.push("Uses react but missing react in peerDependencies");
    }
  }

  // Check "type": "module"
  if (pkg["type"] === "module") {
    result.passes.push('"type": "module"');
  } else {
    if (options?.fix) {
      text = setTopLevelType(text);
      result.passes.push('Auto-fixed: added "type": "module"');
    } else {
      result.warnings.push('Missing "type": "module" in package.json');
    }
  }

  if (text !== original) {
    await writeFile(pkgJsonPath, text, "utf-8");
  }

  await validateEntrySources(pkgJsonPath, result, options);
  await validateSourceTypes(pkgJsonPath, result, options);
  if (await pathExists(tsupTs)) {
    await validateTsupDeclarations(tsupTs, result, options);
  }
}

interface EntryPoint {
  source?: string;
  types?: string;
}

/**
 * An entry without a source gets one: the path it already points at when that is under src, or
 * the src index that its dist output was built from. Its types then follow the source. An entry
 * whose src file cannot be found is left for a person.
 */
async function validateEntrySources(
  pkgJsonPath: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const text = await readFile(pkgJsonPath, "utf-8");
  const pkg = JSON.parse(text) as { exports?: unknown };
  if (!pkg.exports || typeof pkg.exports !== "object") return;

  // Script entries only: a stylesheet or a nested condition has no source of this kind.
  const missing = Object.entries(pkg.exports as Record<string, unknown>).flatMap(([name, entry]) => {
    if (typeof entry !== "object" || entry === null || "source" in entry) return [];
    const { types, import: esm, default: fallback } = entry as Record<string, unknown>;
    const target = types ?? esm ?? fallback;
    return typeof target === "string" && /\.[cm]?[jt]sx?$/.test(target) ? [[name, target] as const] : [];
  });
  if (missing.length === 0) return;

  const found: [string, string][] = [];
  for (const [name, target] of missing) {
    const source = await findEntrySource(dirname(pkgJsonPath), target);
    if (source) {
      found.push([name, source]);
    } else {
      result.warnings.push(`Entry "${name}" has no source and no src file to point it at`);
    }
  }
  if (found.length === 0) return;

  const names = found.map(([name]) => `"${name}"`).join(", ");
  if (!options?.fix) {
    result.warnings.push(`Entries without a source: ${names}`);
    return;
  }

  // The source goes in front of the entry's first condition, with the same spacing.
  const at = text.indexOf('"exports"');
  let exportsText = text.slice(at);
  for (const [name, source] of found) {
    const entry = new RegExp(`(${escapeRegExp(JSON.stringify(name))}\\s*:\\s*\\{)(\\s*)"`);
    exportsText = exportsText.replace(
      entry,
      (_, head: string, space: string) => `${head}${space}"source": ${JSON.stringify(source)},${space}"`,
    );
  }
  await writeFile(pkgJsonPath, text.slice(0, at) + exportsText, "utf-8");
  result.passes.push(`Auto-fixed: added source to ${names}`);
}

async function findEntrySource(pkgDir: string, target: string): Promise<string | undefined> {
  if (target.startsWith("./src/")) return target;

  // ./dist/pages/index.d.ts, ./dist/pages/index.js and ./dist/mock.d.ts come from src/<path>/index.ts.
  const built = /^\.\/dist\/(.+?)(?:\.d)?\.[cm]?[jt]s$/.exec(target);
  if (!built) return undefined;
  const path = built[1].replace(/(^|\/)index$/, "");
  for (const ext of ["ts", "tsx"]) {
    const source = `./src/${path ? `${path}/` : ""}index.${ext}`;
    if (await pathExists(join(pkgDir, source))) return source;
  }
  return undefined;
}

/**
 * Entry types must equal the entry's source. The file is edited as text, one string at a time,
 * so the rest of its formatting survives a fix.
 */
async function validateSourceTypes(
  pkgJsonPath: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const text = await readFile(pkgJsonPath, "utf-8");
  const pkg = JSON.parse(text) as { types?: string; exports?: unknown };
  if (!pkg.exports || typeof pkg.exports !== "object") return;

  const entries = Object.entries(pkg.exports as Record<string, unknown>).filter(
    (e): e is [string, EntryPoint] => typeof e[1] === "object" && e[1] !== null,
  );

  const stale = entries.filter(([, e]) => e.source && e.types && e.types !== e.source);
  const rootSource = entries.find(([name]) => name === ".")?.[1].source;
  const staleTop = rootSource !== undefined && pkg.types !== undefined && pkg.types !== rootSource;
  if (stale.length === 0 && !staleTop) return;

  const names = [...(staleTop ? ['top-level "types"'] : []), ...stale.map(([name]) => `"${name}"`)];
  if (!options?.fix) {
    result.warnings.push(`Types point away from source: ${names.join(", ")}`);
    return;
  }

  let fixed = text.replace(
    /("source"\s*:\s*"([^"]+)"\s*,\s*"types"\s*:\s*")([^"]+)(")/g,
    "$1$2$4",
  );
  if (staleTop) {
    fixed = fixed.replace(/^( {2}"types"\s*:\s*")([^"]+)(")/m, `$1${rootSource}$3`);
  }
  if (fixed !== text) {
    await writeFile(pkgJsonPath, fixed, "utf-8");
    result.passes.push(`Auto-fixed: pointed types at source for ${names.join(", ")}`);
  }

  // An entry written with types before source is outside the text fix.
  const after = JSON.parse(fixed) as { types?: string; exports: Record<string, EntryPoint> };
  const left = Object.entries(after.exports).filter(
    ([, e]) => typeof e === "object" && e?.source && e.types && e.types !== e.source,
  );
  if (left.length > 0 || (staleTop && after.types !== rootSource)) {
    result.warnings.push(`Types still point away from source: ${names.join(", ")}`);
  }
}

/** tsup emits no declarations: types come from source. */
async function validateTsupDeclarations(
  tsupPath: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const text = await readFile(tsupPath, "utf-8");
  if (!/^\s*dts\s*:/m.test(text)) return;

  const fixed = removeDtsSettings(text);
  if (!options?.fix || /^\s*dts\s*:/m.test(fixed)) {
    result.warnings.push("tsup.config.ts emits declarations (dts); types come from source");
    return;
  }
  await writeFile(tsupPath, fixed, "utf-8");
  result.passes.push("Auto-fixed: removed dts from tsup.config.ts");
}

/**
 * Drops every `dts:` property that starts a line, a value spanning lines included: the value runs
 * to the first comma, line end, or closing bracket outside its own brackets and strings.
 */
function removeDtsSettings(text: string): string {
  let fixed = text;
  const starts = [...text.matchAll(/^([ \t]*)dts[ \t]*:\s*/gm)].reverse();
  for (const start of starts) {
    let at = start.index + start[0].length;
    let depth = 0;
    let quote: string | undefined;
    for (; at < fixed.length; at++) {
      const char = fixed[at];
      if (quote) {
        if (char === "\\") at++;
        else if (char === quote) quote = undefined;
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if ("{[(".includes(char)) {
        depth++;
      } else if ("}])".includes(char)) {
        if (depth === 0) break;
        depth--;
      } else if (depth === 0 && (char === "," || char === "\n")) {
        if (char === ",") at++;
        break;
      }
    }

    // The whole line goes when nothing else is left on it, otherwise just the property.
    const rest = /^[ \t]*(\n|$)/.exec(fixed.slice(at));
    fixed = rest
      ? fixed.slice(0, start.index) + fixed.slice(at + rest[0].length)
      : fixed.slice(0, start.index + start[1].length) + fixed.slice(at).replace(/^[ \t]*/, "");
  }
  return fixed;
}

const REACT_PACKAGES = ["react", "react-dom"] as const;
// Wide on purpose: one shared package can serve a web app and a React Native app on different
// React minors.
const REACT_PEER_RANGE = ">=18.0.0";

/** Where a top-level object field's braces sit in the text, and the indent of its key. */
function findSection(
  text: string,
  section: string,
): { start: number; open: number; close: number; indent: string } | undefined {
  const head = new RegExp(`\\n([ \\t]+)${escapeRegExp(JSON.stringify(section))}\\s*:\\s*\\{`).exec(text);
  if (!head) return undefined;
  const open = head.index + head[0].length;
  let depth = 0;
  for (let at = open; at < text.length; at++) {
    const char = text[at];
    if (char === '"') {
      for (at++; at < text.length && text[at] !== '"'; at++) if (text[at] === "\\") at++;
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      if (depth === 0) return { start: head.index, open, close: at, indent: head[1] };
      depth--;
    }
  }
  return undefined;
}

/** Drops one string field from a top-level object, and the object itself once it is empty. */
function removeField(text: string, section: string, name: string): string {
  const found = findSection(text, section);
  if (!found) return text;
  const body = text
    .slice(found.open, found.close)
    .replace(new RegExp(`\\n[ \\t]*${escapeRegExp(JSON.stringify(name))}\\s*:\\s*"[^"]*",?`), "")
    .replace(/,(\s*)$/, "$1");
  if (body.trim() !== "") {
    return text.slice(0, found.open) + body + text.slice(found.close);
  }
  // The emptied object goes with the comma that joined it to its neighbour.
  const before = text.slice(0, found.start);
  const after = text.slice(found.close + 1);
  return before.endsWith(",") ? before.slice(0, -1) + after : before + after.replace(/^,/, "");
}

/** Adds one string field to a top-level object, creating the object after its siblings if needed. */
function setField(text: string, section: string, name: string, value: string): string {
  const field = `${JSON.stringify(name)}: ${JSON.stringify(value)}`;
  const found = findSection(text, section);
  if (found) {
    const body = text.slice(found.open, found.close);
    const inner = `${found.indent}${found.indent}`;
    const content = body.trimEnd();
    const added = content.trim() === "" ? `\n${inner}${field}` : `${content},\n${inner}${field}`;
    return `${text.slice(0, found.open)}${added}\n${found.indent}${text.slice(found.close)}`;
  }
  const anchor = ["peerDependencies", "devDependencies", "dependencies"]
    .map((name) => findSection(text, name))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
    .sort((a, b) => b.close - a.close)[0];
  const indent = anchor?.indent ?? (/\n([ \t]+)"/.exec(text)?.[1] ?? "  ");
  const block = `${indent}${JSON.stringify(section)}: {\n${indent}${indent}${field}\n${indent}}`;
  if (anchor) {
    return `${text.slice(0, anchor.close + 1)},\n${block}${text.slice(anchor.close + 1)}`;
  }
  const end = text.lastIndexOf("}");
  const content = text.slice(0, end).trimEnd();
  return `${content},\n${block}\n${text.slice(end)}`;
}

/** Adds "type": "module" after the version (or the name) line. */
function setTopLevelType(text: string): string {
  const line =
    /\n([ \t]+)"version"\s*:\s*"[^"]*",?/.exec(text) ?? /\n([ \t]+)"name"\s*:\s*"[^"]*",?/.exec(text);
  if (!line) return text.replace("{", '{\n  "type": "module",');
  const end = line.index + line[0].length;
  const comma = line[0].endsWith(",") ? "" : ",";
  return `${text.slice(0, end)}${comma}\n${line[1]}"type": "module"${comma ? "" : ","}${text.slice(end)}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
