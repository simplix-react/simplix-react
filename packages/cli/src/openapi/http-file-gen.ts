import type { ExtractedEntity, SchemaObject } from "./types.js";
import type { SimplixConfig } from "../config/types.js";

/**
 * Convert `:paramName` path segments to `{{paramName}}` for .http file format.
 */
function toHttpPathParams(path: string): string {
  return path.replace(/:(\w+)/g, "{{$1}}");
}

/**
 * Generate .http file content for an entity's CRUD operations.
 */
export function generateHttpFile(
  entity: ExtractedEntity,
  basePath: string,
): string {
  const lines: string[] = [];

  for (const op of entity.operations) {
    const fullPath = `{{baseUrl}}${basePath}${toHttpPathParams(op.path)}`;

    // Section header
    lines.push(`### ${pascalCase(op.name)} ${entity.pascalName}`);

    // Method + URL (with query params if any)
    let url = `${op.method} ${fullPath}`;
    if (op.queryParams.length > 0) {
      const params = op.queryParams
        .map((p) => `${p.name}={{${p.name}}}`)
        .join("&");
      url += `?${params}`;
    }
    lines.push(url);

    // Headers
    if (op.method === "GET" || op.method === "DELETE") {
      lines.push("Accept: application/json");
    } else {
      lines.push("Content-Type: application/json");
    }

    // Request body for operations with input
    if (op.hasInput && op.bodySchema) {
      const body = generateSampleBodyFromSchema(op.bodySchema);
      lines.push("");
      lines.push(body);
    }

    lines.push("");
  }

  return lines.join("\n");
}

function pascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

function generateSampleBodyFromSchema(schema: SchemaObject): string {
  const obj: Record<string, unknown> = {};

  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    obj[name] = getSampleValue({
      name,
      type: prop.type ?? "string",
      format: prop.format,
      enum: prop.enum,
    });
  }

  return JSON.stringify(obj, null, 2);
}

const STRING_FORMAT_SAMPLES: Record<string, () => unknown> = {
  email: () => "user@example.com",
  uuid: () => "00000000-0000-0000-0000-000000000001",
  "date-time": () => new Date().toISOString(),
  date: () => new Date().toISOString().split("T")[0],
  uri: () => "https://example.com",
  url: () => "https://example.com",
  ipv4: () => "192.168.1.1",
};

const TYPE_SAMPLES: Record<string, unknown> = {
  integer: 1,
  number: 1.0,
  boolean: true,
  array: [],
  object: {},
};

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
    const formatSample = field.format && STRING_FORMAT_SAMPLES[field.format];
    return formatSample ? formatSample() : `sample-${field.name}`;
  }

  return TYPE_SAMPLES[field.type] ?? `sample-${field.name}`;
}
