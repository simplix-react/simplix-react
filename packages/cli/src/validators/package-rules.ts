import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { pathExists, readJsonFile } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Package Rules:
 * - All packages must have "exports" field in package.json
 * - tsup.config must exist and match exports
 * - React packages must have peerDependencies for react
 * - Entry types point at the entry's source, so tsc and editors read a package without building it
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
  let modified = false;

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

  // Check React peerDependencies
  const deps = (pkg["dependencies"] ?? {}) as Record<string, string>;
  const devDeps = (pkg["devDependencies"] ?? {}) as Record<string, string>;
  const peerDeps = (pkg["peerDependencies"] ?? {}) as Record<string, string>;

  const hasReactDep = "react" in deps || "react" in devDeps;
  const hasReactPeer = "react" in peerDeps;

  if (hasReactDep && !hasReactPeer) {
    if (options?.fix) {
      if (!pkg["peerDependencies"]) {
        pkg["peerDependencies"] = {};
      }
      (pkg["peerDependencies"] as Record<string, string>)["react"] =
        ">=18.0.0";
      modified = true;
      result.passes.push(
        'Auto-fixed: added react to peerDependencies',
      );
    } else {
      result.warnings.push(
        "Uses react but missing react in peerDependencies",
      );
    }
  }

  // Check "type": "module"
  if (pkg["type"] === "module") {
    result.passes.push('"type": "module"');
  } else {
    if (options?.fix) {
      pkg["type"] = "module";
      modified = true;
      result.passes.push('Auto-fixed: added "type": "module"');
    } else {
      result.warnings.push('Missing "type": "module" in package.json');
    }
  }

  if (modified) {
    await writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }

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

  for (const [name, entry] of entries) {
    if (entry.types && !entry.source) {
      result.warnings.push(`Entry "${name}" declares types but no source`);
    }
  }

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

  // A one-line setting only. A multi-line object is left for a person to remove.
  const fixed = text.replace(/^[ \t]*dts[ \t]*:[^\n{]*,[ \t]*\n/gm, "");
  if (!options?.fix || /^\s*dts\s*:/m.test(fixed)) {
    result.warnings.push("tsup.config.ts emits declarations (dts); types come from source");
    return;
  }
  await writeFile(tsupPath, fixed, "utf-8");
  result.passes.push("Auto-fixed: removed dts from tsup.config.ts");
}
