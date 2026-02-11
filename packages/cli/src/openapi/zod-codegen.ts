import type { SchemaObject, ExtractedEntity } from "./types.js";

/**
 * Convert an OpenAPI SchemaObject to a Zod type string.
 */
export function toZodType(schema: SchemaObject): string {
  let base = buildBaseZodType(schema);

  // Add constraints
  base = addConstraints(base, schema);

  // Handle nullable
  if (schema.nullable) {
    base += ".nullable()";
  }

  return base;
}

function buildBaseZodType(schema: SchemaObject): string {
  // Enum
  if (schema.enum?.length) {
    const values = schema.enum.map((v) => `"${v}"`).join(", ");
    return `z.enum([${values}])`;
  }

  // Array
  if (schema.type === "array" && schema.items) {
    const itemType = toZodType(schema.items);
    return `z.array(${itemType})`;
  }

  // Nested object
  if (schema.type === "object" && schema.properties) {
    const entries = Object.entries(schema.properties);
    if (entries.length === 0) {
      return "z.record(z.unknown())";
    }
    const requiredSet = new Set(schema.required ?? []);
    const fields = entries
      .map(([key, prop]) => {
        let fieldType = toZodType(prop);
        if (!requiredSet.has(key)) {
          fieldType += ".optional()";
        }
        return `  ${key}: ${fieldType},`;
      })
      .join("\n");
    return `z.object({\n${fields}\n})`;
  }

  // String with format
  if (schema.type === "string") {
    return formatStringZod(schema.format);
  }

  // Integer
  if (schema.type === "integer") {
    return "z.number().int()";
  }

  // Number
  if (schema.type === "number") {
    return "z.number()";
  }

  // Boolean
  if (schema.type === "boolean") {
    return "z.boolean()";
  }

  // Object without properties
  if (schema.type === "object") {
    return "z.record(z.unknown())";
  }

  // Fallback
  return "z.unknown()";
}

function formatStringZod(format?: string): string {
  switch (format) {
    case "uuid":
      return "z.string().uuid()";
    case "email":
      return "z.string().email()";
    case "date-time":
      return "z.string().datetime()";
    case "date":
      return "z.string().date()";
    case "uri":
    case "url":
      return "z.string().url()";
    case "ipv4":
      return "z.string().regex(/^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/)";
    case "ipv6":
      return "z.string()";
    default:
      return "z.string()";
  }
}

function addConstraints(base: string, schema: SchemaObject): string {
  const parts: string[] = [];

  if (schema.minLength !== undefined) {
    parts.push(`.min(${schema.minLength})`);
  }
  if (schema.maxLength !== undefined) {
    parts.push(`.max(${schema.maxLength})`);
  }
  if (schema.minimum !== undefined) {
    parts.push(`.min(${schema.minimum})`);
  }
  if (schema.maximum !== undefined) {
    parts.push(`.max(${schema.maximum})`);
  }
  if (schema.pattern) {
    parts.push(`.regex(/${schema.pattern}/)`);
  }

  return base + parts.join("");
}

/**
 * Convert an OpenAPI SchemaObject to a SQL type string.
 */
export function toSqlType(schema: SchemaObject): string {
  if (schema.type === "string") {
    switch (schema.format) {
      case "uuid":
        return "UUID";
      case "date-time":
        return "TIMESTAMPTZ";
      default:
        return "TEXT";
    }
  }
  if (schema.type === "integer") return "INTEGER";
  if (schema.type === "number") return "NUMERIC";
  if (schema.type === "boolean") return "BOOLEAN";
  if (schema.type === "array" || schema.type === "object") return "JSONB";
  return "TEXT";
}

/**
 * Generate complete Zod schema file content for an entity.
 */
export function generateZodSchemas(entities: ExtractedEntity[]): string {
  const lines: string[] = ['import { z } from "zod";', ""];

  for (const entity of entities) {
    // Main schema
    const fieldEntries = entity.fields
      .map((f) => {
        let field = `  ${f.name}: ${f.zodType}`;
        if (!f.required && !f.zodType.includes(".optional()")) {
          field += ".optional()";
        }
        return field + ",";
      })
      .join("\n");

    lines.push(`export const ${entity.name}Schema = z.object({`);
    lines.push(fieldEntries);
    lines.push("});");
    lines.push("");

    // Create schema — omit id, timestamps
    const omitFields = entity.fields
      .filter((f) => ["id", "createdAt", "updatedAt", "created_at", "updated_at"].includes(f.name))
      .map((f) => `  ${f.name}: true,`)
      .join("\n");

    if (omitFields) {
      lines.push(
        `export const create${entity.pascalName}Schema = ${entity.name}Schema.omit({`,
      );
      lines.push(omitFields);
      lines.push("});");
    } else {
      lines.push(
        `export const create${entity.pascalName}Schema = ${entity.name}Schema;`,
      );
    }
    lines.push("");

    // Update schema — partial of create
    lines.push(
      `export const update${entity.pascalName}Schema = create${entity.pascalName}Schema.partial();`,
    );
    lines.push("");

    // Type exports
    lines.push(
      `export type ${entity.pascalName} = z.infer<typeof ${entity.name}Schema>;`,
    );
    lines.push(
      `export type Create${entity.pascalName} = z.infer<typeof create${entity.pascalName}Schema>;`,
    );
    lines.push(
      `export type Update${entity.pascalName} = z.infer<typeof update${entity.pascalName}Schema>;`,
    );
    lines.push("");
  }

  return lines.join("\n");
}
