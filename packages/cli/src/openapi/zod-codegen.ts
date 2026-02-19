import type { SchemaObject, ExtractedEntity } from "./types.js";
import { toPascalCase } from "./entity-extractor.js";

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

  // allOf — merge all sub-schemas
  if (schema.allOf?.length) {
    const merged = mergeAllOfSchemas(schema.allOf);
    return toZodType(merged);
  }

  // oneOf / anyOf — z.union
  if (schema.oneOf?.length || schema.anyOf?.length) {
    const variants = (schema.oneOf ?? schema.anyOf)!;
    if (variants.length === 1) return toZodType(variants[0]);
    const types = variants.map((s) => toZodType(s));
    return `z.union([${types.join(", ")}])`;
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
      return "z.record(z.string(), z.unknown())";
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
    return "z.record(z.string(), z.unknown())";
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
 * Generate complete Zod schema file content for an entity.
 */
export function generateZodSchemas(entities: ExtractedEntity[]): string {
  const lines: string[] = ['import { z } from "zod";', ""];

  for (const entity of entities) {
    // Main schema
    if (entity.schemaOverride) {
      lines.push(`export const ${entity.name}Schema = ${entity.schemaOverride};`);
    } else {
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
    }
    lines.push("");

    // Operation input schemas — unified naming: ${opName}${PascalName}Schema
    for (const op of entity.operations) {
      if (!op.bodySchema) continue;
      const schemaName = `${op.name}${entity.pascalName}Schema`;
      const schemaCode = generateInlineSchema(op.bodySchema);
      lines.push(`export const ${schemaName} = ${schemaCode};`);
      lines.push("");
    }

    // Type exports
    lines.push(
      `export type ${entity.pascalName} = z.infer<typeof ${entity.name}Schema>;`,
    );
    for (const op of entity.operations) {
      if (!op.bodySchema) continue;
      const typeName = `${toPascalCase(op.name)}${entity.pascalName}`;
      const schemaName = `${op.name}${entity.pascalName}Schema`;
      lines.push(
        `export type ${typeName} = z.infer<typeof ${schemaName}>;`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateInlineSchema(schema: SchemaObject): string {
  if (!schema.properties) {
    return toZodType(schema);
  }

  const requiredSet = new Set(schema.required ?? []);
  const fields = Object.entries(schema.properties)
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

/**
 * Merge allOf sub-schemas by combining properties and required arrays.
 */
function mergeAllOfSchemas(schemas: SchemaObject[]): SchemaObject {
  const merged: SchemaObject = { type: "object", properties: {}, required: [] };

  for (const s of schemas) {
    if (s.properties) {
      Object.assign(merged.properties!, s.properties);
    }
    if (s.required) {
      merged.required!.push(...s.required);
    }
  }

  if (merged.required!.length === 0) {
    delete merged.required;
  }

  return merged;
}
