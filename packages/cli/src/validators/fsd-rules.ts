import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { pathExists } from "../utils/fs.js";
import { collectTsFiles } from "../utils/collect-files.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * FSD Layer Rules:
 * - features/ cannot import from widgets/
 * - shared/ cannot import from features/ or widgets/
 * - A module declares no `ModuleManifest` stub: nothing in the framework or an app reads one, and
 *   the `add-module` template that wrote it no longer does
 */
/** The interface the `add-module` template used to declare in every module's `src/manifest.ts`. */
const UNREAD_MANIFEST = /\binterface\s+ModuleManifest\b/;

export async function validateFsdRules(
  moduleDir: string,
  result: ValidationResult,
  _options?: { fix?: boolean; type?: "module" | "app" },
): Promise<void> {
  const srcDir = join(moduleDir, "src");
  if (!(await pathExists(srcDir))) return;

  // A manifest stub an older `add-module` wrote: declared, re-exported, read by nobody.
  const manifestPath = join(srcDir, "manifest.ts");
  if (await pathExists(manifestPath)) {
    const content = await readFile(manifestPath, "utf-8");
    if (UNREAD_MANIFEST.test(content)) {
      result.warnings.push(
        "src/manifest.ts declares the ModuleManifest stub nothing reads: delete it and its re-export in src/index.ts",
      );
    }
  }

  // Check FSD layer violations
  const featuresDir = join(srcDir, "features");
  const sharedDir = join(srcDir, "shared");

  // features/ should not import from widgets/
  if (await pathExists(featuresDir)) {
    const violations = await findImportViolations(
      featuresDir,
      ["widgets/", "../widgets/", "../../widgets/"],
    );
    if (violations.length > 0) {
      for (const v of violations) {
        result.errors.push(
          `features/ imports from widgets/ (${v.file}:${v.line})`,
        );
      }
    } else {
      result.passes.push("FSD: features/ has no widgets/ imports");
    }
  }

  // shared/ should not import from features/ or widgets/
  if (await pathExists(sharedDir)) {
    const violations = await findImportViolations(
      sharedDir,
      [
        "features/",
        "../features/",
        "../../features/",
        "widgets/",
        "../widgets/",
        "../../widgets/",
      ],
    );
    if (violations.length > 0) {
      for (const v of violations) {
        result.errors.push(
          `shared/ imports from ${v.importPath} (${v.file}:${v.line})`,
        );
      }
    } else {
      result.passes.push("FSD: shared/ has no features/widgets imports");
    }
  }
}

interface ImportViolation {
  file: string;
  line: number;
  importPath: string;
}

async function findImportViolations(
  dir: string,
  forbiddenPatterns: string[],
): Promise<ImportViolation[]> {
  const violations: ImportViolation[] = [];
  const files = await collectTsFiles(dir);

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match import/require statements
      const importMatch = line.match(
        /(?:import|from|require)\s*\(?["']([^"']+)["']/,
      );
      if (!importMatch) continue;

      const importPath = importMatch[1];
      // Only report once per line even if multiple patterns match
      const isViolation = forbiddenPatterns.some((p) =>
        importPath.includes(p),
      );
      if (isViolation) {
        violations.push({ file, line: i + 1, importPath });
      }
    }
  }

  return violations;
}
