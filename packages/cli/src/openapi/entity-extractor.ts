import { camelToSnake } from "@simplix-react/contract";
import type {
  OpenAPISpec,
  SchemaObject,
  ExtractedEntity,
  EntityField,
  QueryParam,
  CRUDOperations,
  ParameterObject,
} from "./types.js";
import { toZodType, toSqlType } from "./zod-codegen.js";

/**
 * Extract entities from OpenAPI spec paths using CRUD pattern detection.
 */
export function extractEntities(spec: OpenAPISpec): ExtractedEntity[] {
  const pathGroups = groupPathsByResource(spec);
  const entities: ExtractedEntity[] = [];

  for (const [resourcePath, group] of Object.entries(pathGroups)) {
    const entity = buildEntity(spec, resourcePath, group);
    if (entity) {
      entities.push(entity);
    }
  }

  return entities;
}

interface PathGroup {
  basePath: string;
  collectionPath?: string;
  itemPath?: string;
  parent?: { param: string; path: string };
}

/**
 * Group paths by resource. E.g.:
 *   /users -> collection
 *   /users/{id} -> item
 *   /topologies/{topologyId}/controllers -> nested collection
 */
function groupPathsByResource(spec: OpenAPISpec): Record<string, PathGroup> {
  const groups: Record<string, PathGroup> = {};

  for (const path of Object.keys(spec.paths)) {
    const segments = path.split("/").filter(Boolean);

    // Skip paths with fewer than 1 segment
    if (segments.length === 0) continue;

    // Check if last segment is a path parameter like {id}
    const lastSegment = segments[segments.length - 1];
    const isItemPath = lastSegment.startsWith("{") && lastSegment.endsWith("}");

    if (isItemPath && segments.length >= 2) {
      // Item path: /resources/{id} or /parent/{parentId}/resources/{id}
      const resourceSegment = segments[segments.length - 2];
      const basePath = "/" + segments.slice(0, -1).join("/");
      const key = basePath;

      if (!groups[key]) {
        groups[key] = { basePath };
      }
      groups[key].itemPath = path;

      // Detect parent relationship
      const parent = detectParent(segments, resourceSegment);
      if (parent) {
        groups[key].parent = parent;
      }
    } else {
      // Collection path: /resources or /parent/{parentId}/resources
      const key = path;

      if (!groups[key]) {
        groups[key] = { basePath: path };
      }
      groups[key].collectionPath = path;

      // Detect parent relationship
      const resourceSegment = segments[segments.length - 1];
      const parent = detectParent(segments, resourceSegment);
      if (parent) {
        groups[key].parent = parent;
      }
    }
  }

  return groups;
}

function detectParent(
  segments: string[],
  _resourceSegment: string,
): { param: string; path: string } | undefined {
  // Look for pattern: /parent/{parentId}/resource
  for (let i = segments.length - 2; i >= 1; i--) {
    const seg = segments[i];
    if (seg.startsWith("{") && seg.endsWith("}")) {
      const paramName = seg.slice(1, -1);
      const parentPath = "/" + segments.slice(0, i).join("/");
      return { param: paramName, path: parentPath };
    }
  }
  return undefined;
}

function buildEntity(
  spec: OpenAPISpec,
  _resourcePath: string,
  group: PathGroup,
): ExtractedEntity | null {
  const operations = detectOperations(spec, group);

  // Must have at least one operation
  if (!Object.values(operations).some(Boolean)) return null;

  // Extract entity name from the base path
  const segments = group.basePath.split("/").filter(Boolean);
  const resourceSegment = segments[segments.length - 1];

  // Singularize: "controllers" -> "controller", "audit-logs" -> "auditLog"
  const pluralName = resourceSegment;
  const name = toCamelCase(singularize(resourceSegment));
  const pascalName = toPascalCase(singularize(resourceSegment));

  // Extract schema fields from the spec
  const schema = extractEntitySchema(spec, group, operations);
  const fields = schemaToFields(schema);

  // Auto-detect timestamp fields
  const autoExcludeFields = new Set(["id", "createdAt", "updatedAt", "created_at", "updated_at"]);
  const createFields = fields.filter((f) => !autoExcludeFields.has(f.name));
  const updateFields = createFields.map((f) => ({
    ...f,
    required: false,
  }));

  // Extract query params from list operation
  const queryParams = extractQueryParams(spec, group);

  // Collect tags from all operations
  const tags = collectTags(spec, group);

  return {
    name,
    pascalName,
    pluralName,
    path: group.basePath,
    parent: group.parent,
    fields,
    createFields,
    updateFields,
    queryParams,
    operations,
    tags,
  };
}

function collectTags(spec: OpenAPISpec, group: PathGroup): string[] {
  const tagSet = new Set<string>();

  for (const path of [group.collectionPath, group.itemPath]) {
    if (!path) continue;
    const pathItem = spec.paths[path];
    if (!pathItem) continue;

    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      const op = pathItem[method];
      if (op?.tags) {
        for (const tag of op.tags) {
          tagSet.add(tag);
        }
      }
    }
  }

  return [...tagSet];
}

function detectOperations(
  spec: OpenAPISpec,
  group: PathGroup,
): CRUDOperations {
  const ops: CRUDOperations = {
    list: false,
    get: false,
    create: false,
    update: false,
    delete: false,
  };

  if (group.collectionPath) {
    const pathItem = spec.paths[group.collectionPath];
    if (pathItem?.get) ops.list = true;
    if (pathItem?.post) ops.create = true;
  }

  if (group.itemPath) {
    const pathItem = spec.paths[group.itemPath];
    if (pathItem?.get) ops.get = true;
    if (pathItem?.put || pathItem?.patch) ops.update = true;
    if (pathItem?.delete) ops.delete = true;
  }

  return ops;
}

function extractEntitySchema(
  spec: OpenAPISpec,
  group: PathGroup,
  operations: CRUDOperations,
): SchemaObject {
  // Priority: GET item response > GET list response item > POST request body

  // Try GET item response
  if (operations.get && group.itemPath) {
    const schema = extractResponseSchema(spec, group.itemPath, "get");
    if (schema?.properties) return schema;
  }

  // Try GET list response (look for array items)
  if (operations.list && group.collectionPath) {
    const schema = extractResponseSchema(spec, group.collectionPath, "get");
    if (schema) {
      // Might be wrapped in { data: [...] } or directly an array
      if (schema.type === "array" && schema.items?.properties) {
        return schema.items;
      }
      if (schema.properties?.data?.type === "array" && schema.properties.data.items?.properties) {
        return schema.properties.data.items;
      }
      // Direct object with items in properties
      if (schema.properties?.items?.type === "array" && schema.properties.items.items?.properties) {
        return schema.properties.items.items;
      }
    }
  }

  // Try POST request body
  if (operations.create && group.collectionPath) {
    const pathItem = spec.paths[group.collectionPath];
    const schema =
      pathItem?.post?.requestBody?.content?.["application/json"]?.schema;
    if (schema?.properties) {
      // Add id + timestamps that would be in the full entity
      return {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          ...schema.properties,
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          ...(schema.required ?? []),
          "createdAt",
          "updatedAt",
        ],
      };
    }
  }

  // Fallback: minimal entity with just id
  return {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "createdAt", "updatedAt"],
  };
}

function extractResponseSchema(
  spec: OpenAPISpec,
  path: string,
  method: "get" | "post" | "put" | "patch",
): SchemaObject | undefined {
  const pathItem = spec.paths[path];
  const op = pathItem?.[method];
  if (!op?.responses) return undefined;

  // Check 200, 201 response schemas
  for (const code of ["200", "201"]) {
    const response = op.responses[code];
    const schema = response?.content?.["application/json"]?.schema;
    if (schema) return schema;
  }

  return undefined;
}

function extractQueryParams(
  spec: OpenAPISpec,
  group: PathGroup,
): QueryParam[] {
  if (!group.collectionPath) return [];

  const pathItem = spec.paths[group.collectionPath];
  const params: ParameterObject[] = [
    ...(pathItem?.parameters ?? []),
    ...(pathItem?.get?.parameters ?? []),
  ];

  return params
    .filter((p) => p.in === "query")
    .map((p) => ({
      name: p.name,
      type: p.schema?.type ?? "string",
      required: p.required ?? false,
      description: p.description,
    }));
}

function schemaToFields(schema: SchemaObject): EntityField[] {
  if (!schema.properties) return [];

  const requiredSet = new Set(schema.required ?? []);
  const fields: EntityField[] = [];

  for (const [name, prop] of Object.entries(schema.properties)) {
    const isRequired = requiredSet.has(name);
    const isNullable = prop.nullable ?? false;

    fields.push({
      name,
      snakeName: camelToSnake(name),
      type: prop.type ?? "string",
      format: prop.format,
      zodType: toZodType(prop),
      sqlType: toSqlType(prop),
      required: isRequired,
      nullable: isNullable,
      default: prop.default,
      enum: prop.enum,
    });
  }

  return fields;
}

// --- Utility functions ---

function singularize(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

