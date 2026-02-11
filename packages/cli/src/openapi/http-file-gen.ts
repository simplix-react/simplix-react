import type { ExtractedEntity } from "./types.js";
import type { SimplixConfig } from "../config/types.js";

/**
 * Generate .http file content for an entity's CRUD operations.
 */
export function generateHttpFile(
  entity: ExtractedEntity,
  basePath: string,
): string {
  const lines: string[] = [];
  const entityPath = `{{baseUrl}}${basePath}${entity.path}`;
  const idVar = `{{${entity.name}Id}}`;

  if (entity.operations.list) {
    lines.push(`### List ${entity.pascalName}s`);
    lines.push(`GET ${entityPath}`);
    if (entity.queryParams.length > 0) {
      const params = entity.queryParams
        .map((p) => `${p.name}={{${p.name}}}`)
        .join("&");
      // Replace last line to add query params
      lines[lines.length - 1] = `GET ${entityPath}?${params}`;
    }
    lines.push("Accept: application/json");
    lines.push("");
  }

  if (entity.operations.get) {
    lines.push(`### Get ${entity.pascalName} by ID`);
    lines.push(`GET ${entityPath}/${idVar}`);
    lines.push("Accept: application/json");
    lines.push("");
  }

  if (entity.operations.create) {
    const body = generateSampleBody(entity.createFields);
    lines.push(`### Create ${entity.pascalName}`);
    lines.push(`POST ${entityPath}`);
    lines.push("Content-Type: application/json");
    lines.push("");
    lines.push(body);
    lines.push("");
  }

  if (entity.operations.update) {
    // Use a subset of fields for update sample
    const updateFields = entity.updateFields.slice(0, 3);
    const body = generateSampleBody(updateFields);
    lines.push(`### Update ${entity.pascalName}`);
    lines.push(`PATCH ${entityPath}/${idVar}`);
    lines.push("Content-Type: application/json");
    lines.push("");
    lines.push(body);
    lines.push("");
  }

  if (entity.operations.delete) {
    lines.push(`### Delete ${entity.pascalName}`);
    lines.push(`DELETE ${entityPath}/${idVar}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate http-client.env.json content from config.
 */
export function generateHttpEnvJson(config: SimplixConfig): string {
  const environments = config.http?.environments ?? {
    development: { baseUrl: "http://localhost:3000" },
  };

  return JSON.stringify(environments, null, 2);
}

function generateSampleBody(
  fields: { name: string; type: string; format?: string; enum?: string[] }[],
): string {
  const obj: Record<string, unknown> = {};

  for (const field of fields) {
    obj[field.name] = getSampleValue(field);
  }

  return JSON.stringify(obj, null, 2);
}

function getSampleValue(field: {
  name: string;
  type: string;
  format?: string;
  enum?: string[];
}): unknown {
  if (field.enum?.length) {
    return field.enum[0];
  }

  if (field.type === "string") {
    switch (field.format) {
      case "email":
        return "user@example.com";
      case "uuid":
        return "00000000-0000-0000-0000-000000000001";
      case "date-time":
        return new Date().toISOString();
      case "date":
        return new Date().toISOString().split("T")[0];
      case "uri":
      case "url":
        return "https://example.com";
      case "ipv4":
        return "192.168.1.1";
      default:
        return `sample-${field.name}`;
    }
  }

  if (field.type === "integer") return 1;
  if (field.type === "number") return 1.0;
  if (field.type === "boolean") return true;
  if (field.type === "array") return [];
  if (field.type === "object") return {};

  return `sample-${field.name}`;
}
