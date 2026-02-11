import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { pathExists, readJsonFile } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Package Rules:
 * - All packages must have "exports" field in package.json
 * - tsup.config must exist and match exports
 * - React packages must have peerDependencies for react
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
}
