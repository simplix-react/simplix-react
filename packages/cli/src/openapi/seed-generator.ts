import type { ExtractedEntity, EntityField } from "./types.js";
import { camelToSnake } from "@simplix-react/contract";

const SEED_COUNT = 5;

/**
 * Generates TypeScript seed data code from extracted entities.
 *
 * Produces realistic fake values based on field name heuristics and types.
 *
 * @param entities - Extracted entities from OpenAPI spec
 * @param domainName - Domain name used for store key prefix
 * @returns TypeScript object literal string for seed data
 */
export function generateSeedCode(
  entities: ExtractedEntity[],
  domainName: string,
): string {
  const entries: string[] = [];

  for (const entity of entities) {
    // Skip entities with no fields (e.g. z.record schemas like inventory)
    if (entity.fields.length === 0) continue;

    const storeName = `${domainName}_${camelToSnake(entity.name)}`;
    const rows: string[] = [];

    for (let i = 1; i <= SEED_COUNT; i++) {
      const fields: string[] = [];
      for (const field of entity.fields) {
        const value = generateFieldValue(field, i, entity.name);
        if (value !== undefined) {
          fields.push(`      ${field.name}: ${value}`);
        }
      }
      rows.push(`    {\n${fields.join(",\n")},\n    }`);
    }

    entries.push(`  ${storeName}: [\n${rows.join(",\n")},\n  ]`);
  }

  return `{\n${entries.join(",\n")},\n}`;
}

function generateFieldValue(
  field: EntityField,
  index: number,
  entityName: string,
): string | undefined {
  const name = field.name.toLowerCase();

  // ID field
  if (name === "id") {
    return String(index);
  }

  // Enum fields — cycle through values
  if (field.enum && field.enum.length > 0) {
    const val = field.enum[(index - 1) % field.enum.length];
    return `"${val}"`;
  }

  // Type-based generation with name heuristics
  switch (field.type) {
    case "integer":
    case "number":
      return generateNumericValue(name, index);
    case "boolean":
      return index % 2 === 0 ? "true" : "false";
    case "string":
      return generateStringValue(name, index, entityName, field.format);
    case "array":
      return generateArrayValue(field, index);
    case "object":
      return generateObjectValue(field, index);
    default:
      if (!field.required) return undefined;
      return `"${entityName}-${field.name}-${index}"`;
  }
}

function generateNumericValue(fieldName: string, index: number): string {
  if (fieldName.includes("price") || fieldName.includes("amount") || fieldName.includes("cost")) {
    return String(((index * 19.99) % 100).toFixed(2));
  }
  if (fieldName.includes("quantity") || fieldName.includes("count")) {
    return String(index * 2);
  }
  if (fieldName.includes("age")) {
    return String(20 + index * 5);
  }
  if (fieldName === "status") {
    return String(index % 3);
  }
  if (fieldName.endsWith("id")) {
    return String(index);
  }
  return String(index * 10);
}

function generateStringValue(
  fieldName: string,
  index: number,
  entityName: string,
  format?: string,
): string {
  // Format-based
  if (format === "date-time" || format === "date") {
    const d = new Date(2025, 0, index * 5);
    return format === "date"
      ? `"${d.toISOString().split("T")[0]}"`
      : `"${d.toISOString()}"`;
  }
  if (format === "email" || fieldName.includes("email")) {
    return `"user${index}@example.com"`;
  }
  if (format === "uri" || format === "url") {
    return `"https://example.com/${entityName}/${index}"`;
  }
  if (format === "uuid") {
    return `"00000000-0000-0000-0000-00000000000${index}"`;
  }
  if (format === "password" || fieldName.includes("password")) {
    return `"password${index}"`;
  }

  // Name heuristics
  if (fieldName === "name" || fieldName === "title") {
    return `"${capitalize(entityName)} ${index}"`;
  }
  if (fieldName.includes("firstname") || fieldName === "first_name") {
    return `"${FIRST_NAMES[(index - 1) % FIRST_NAMES.length]}"`;
  }
  if (fieldName.includes("lastname") || fieldName === "last_name") {
    return `"${LAST_NAMES[(index - 1) % LAST_NAMES.length]}"`;
  }
  if (fieldName.includes("username")) {
    return `"user${index}"`;
  }
  if (fieldName.includes("phone")) {
    return `"555-010${index}"`;
  }
  if (fieldName.includes("address")) {
    return `"${index * 100} Main Street"`;
  }
  if (fieldName.includes("description") || fieldName.includes("summary")) {
    return `"Sample ${entityName} description ${index}"`;
  }
  if (fieldName.includes("url") || fieldName.includes("image") || fieldName.includes("photo")) {
    return `"https://example.com/images/${entityName}${index}.jpg"`;
  }

  return `"${fieldName}-${index}"`;
}

function generateArrayValue(field: EntityField, index: number): string {
  const name = field.name.toLowerCase();

  // Photo URLs
  if (name.includes("url") || name.includes("image") || name.includes("photo")) {
    return `["https://example.com/images/${index}.jpg"]`;
  }

  // Tags or similar arrays of objects
  if (name.includes("tag")) {
    return `[{ id: ${index}, name: "tag-${index}" }]`;
  }

  return `[]`;
}

function generateObjectValue(field: EntityField, index: number): string {
  const name = field.name.toLowerCase();

  if (name.includes("category")) {
    return `{ id: ${index}, name: "Category ${index}" }`;
  }

  return `{ id: ${index} }`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FIRST_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
