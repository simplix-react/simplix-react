import { join, relative } from "node:path";
import { readFile } from "node:fs/promises";
import { pathExists } from "../utils/fs.js";
import { collectTsFiles } from "../utils/collect-files.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Import Rules:
 * - No cross-module direct imports (use package exports)
 * - No circular dependencies between packages (basic check)
 * - apps/ should not contain reusable utilities
 */
export async function validateImportRules(
  moduleDir: string,
  result: ValidationResult,
  rootDir: string,
  options?: { fix?: boolean },
): Promise<void> {
  const srcDir = join(moduleDir, "src");
  if (!(await pathExists(srcDir))) return;

  const files = await collectTsFiles(srcDir);

  // Check for cross-module direct imports
  let hasCrossModuleImport = false;

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(
        /(?:import|from)\s+["']([^"']+)["']/,
      );
      if (!importMatch) continue;

      const importPath = importMatch[1];

      // Check for relative imports that go outside the module
      if (importPath.startsWith("../../../modules/")) {
        hasCrossModuleImport = true;
        const relFile = relative(moduleDir, file);
        result.errors.push(
          `Cross-module import: ${relFile}:${i + 1} imports "${importPath}"`,
        );
      }
    }
  }

  if (!hasCrossModuleImport) {
    result.passes.push("No cross-module direct imports");
  }
}
