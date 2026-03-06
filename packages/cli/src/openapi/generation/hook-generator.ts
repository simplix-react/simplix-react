import { join } from "node:path";
import { writeFileWithDir } from "../../utils/fs.js";
import type { ResponseAdapterConfig } from "../adaptation/response-adapter.js";
import type { ExtractedEntity, ExtractedOperation } from "../types.js";

/**
 * Generate thin hooks layer that re-exports Orval hooks.
 *
 * All hooks are re-exported as-is from generated endpoints.
 * Error response types are already stripped by narrowResponseTypes.
 *
 * @param hookImportMap - When provided, uses per-file import paths instead of barrel import.
 * @param responseAdapter - Reserved for future use.
 */
export async function generateHookFiles(
  targetDir: string,
  entities: ExtractedEntity[],
  hookImportMap?: Map<string, string>,
  responseAdapter?: ResponseAdapterConfig,
): Promise<void> {
  if (entities.length === 0) return;

  const hooksDir = join(targetDir, "src/hooks");

  const entityFiles: { fileName: string; content: string }[] = [];

  for (const entity of entities) {
    const content = generateEntityHookFile(entity, hookImportMap);
    if (content) {
      entityFiles.push({ fileName: `${entity.name}.ts`, content });
    }
  }

  if (entityFiles.length === 0) return;

  for (const { fileName, content } of entityFiles) {
    await writeFileWithDir(join(hooksDir, fileName), content);
  }

  const barrel = entityFiles
    .map(({ fileName }) => `export * from "./${fileName.replace(".ts", "")}";`)
    .join("\n") + "\n";
  await writeFileWithDir(join(hooksDir, "index.ts"), barrel);
}

function generateEntityHookFile(
  entity: ExtractedEntity,
  hookImportMap?: Map<string, string>,
): string | null {
  const ops = entity.operations.filter((op) => op.operationId);
  if (ops.length === 0) return null;

  const lines: string[] = [];

  if (hookImportMap && hookImportMap.size > 0) {
    // Collect unique import source files
    const hookNames = ops.map((op) => getHookName(op));
    const sources = new Set<string>();
    for (const name of hookNames) {
      sources.add(hookImportMap.get(name) ?? "../generated/endpoints");
    }
    for (const source of sources) {
      lines.push(`export * from "${source}";`);
    }
  } else {
    lines.push(`export * from "../generated/endpoints";`);
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Get the hook name for an operation, preferring the naming-strategy-resolved name.
 * Falls back to operationId-based derivation when no naming strategy was applied.
 */
function getHookName(op: ExtractedOperation): string {
  return op.resolvedHookName ?? `use${op.operationId!.charAt(0).toUpperCase()}${op.operationId!.slice(1)}`;
}
