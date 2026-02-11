import pc from "picocolors";
import type {
  OpenAPISnapshot,
  ExtractedEntity,
  DiffResult,
  EntityModification,
  FieldChange,
} from "./types.js";

/**
 * Compare previous snapshot with newly extracted entities.
 */
export function computeDiff(
  previous: OpenAPISnapshot,
  current: ExtractedEntity[],
): DiffResult {
  const prevMap = new Map(previous.entities.map((e) => [e.name, e]));
  const currMap = new Map(current.map((e) => [e.name, e]));

  const added: ExtractedEntity[] = [];
  const removed: ExtractedEntity[] = [];
  const modified: EntityModification[] = [];

  // Find added and modified
  for (const [name, currEntity] of currMap) {
    const prevEntity = prevMap.get(name);
    if (!prevEntity) {
      added.push(currEntity);
      continue;
    }

    const mod = diffEntity(prevEntity, currEntity);
    if (mod) {
      modified.push(mod);
    }
  }

  // Find removed
  for (const [name, prevEntity] of prevMap) {
    if (!currMap.has(name)) {
      removed.push(prevEntity);
    }
  }

  const hasChanges =
    added.length > 0 || removed.length > 0 || modified.length > 0;

  return { added, removed, modified, hasChanges };
}

function diffEntity(
  prev: ExtractedEntity,
  curr: ExtractedEntity,
): EntityModification | null {
  const prevFieldMap = new Map(prev.fields.map((f) => [f.name, f]));
  const currFieldMap = new Map(curr.fields.map((f) => [f.name, f]));

  const addedFields = curr.fields.filter((f) => !prevFieldMap.has(f.name));
  const removedFields = prev.fields
    .filter((f) => !currFieldMap.has(f.name))
    .map((f) => f.name);
  const changedFields: FieldChange[] = [];

  for (const [name, currField] of currFieldMap) {
    const prevField = prevFieldMap.get(name);
    if (!prevField) continue;

    if (prevField.zodType !== currField.zodType) {
      changedFields.push({
        name,
        field: "zodType",
        from: prevField.zodType,
        to: currField.zodType,
      });
    }
    if (prevField.required !== currField.required) {
      changedFields.push({
        name,
        field: "required",
        from: String(prevField.required),
        to: String(currField.required),
      });
    }
    if (prevField.nullable !== currField.nullable) {
      changedFields.push({
        name,
        field: "nullable",
        from: String(prevField.nullable),
        to: String(currField.nullable),
      });
    }
  }

  if (
    addedFields.length === 0 &&
    removedFields.length === 0 &&
    changedFields.length === 0
  ) {
    return null;
  }

  return {
    entityName: curr.name,
    addedFields,
    removedFields,
    changedFields,
  };
}

/**
 * Format diff result as colored console output.
 */
export function formatDiff(diff: DiffResult): string {
  const lines: string[] = [];
  const totalChanges =
    diff.added.length + diff.removed.length + diff.modified.length;

  lines.push(
    pc.bold(`OpenAPI Diff: ${totalChanges} change(s) detected`),
  );
  lines.push("");

  if (diff.added.length > 0) {
    lines.push(pc.green("✚ Added entities:"));
    for (const entity of diff.added) {
      lines.push(
        pc.green(`  → ${entity.name} (${entity.fields.length} fields)`),
      );
    }
    lines.push("");
  }

  if (diff.modified.length > 0) {
    lines.push(pc.yellow("✎ Modified entities:"));
    for (const mod of diff.modified) {
      lines.push(pc.yellow(`  → ${mod.entityName}`));
      for (const field of mod.addedFields) {
        lines.push(
          pc.green(
            `    ✚ ${field.name}: ${field.type}${field.required ? "" : " (optional)"}`,
          ),
        );
      }
      for (const name of mod.removedFields) {
        lines.push(pc.red(`    ✖ ${name}: removed`));
      }
      for (const change of mod.changedFields) {
        lines.push(
          pc.cyan(`    ✎ ${change.name}: ${change.from} → ${change.to}`),
        );
      }
    }
    lines.push("");
  }

  if (diff.removed.length > 0) {
    lines.push(pc.red("✖ Removed entities:"));
    for (const entity of diff.removed) {
      lines.push(pc.red(`  → ${entity.name}`));
    }
    lines.push("");
  }

  if (!diff.hasChanges) {
    lines.push(pc.dim("  No changes detected."));
  }

  return lines.join("\n");
}
