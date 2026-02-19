import { camelToSnake } from "@simplix-react/contract";
import type {
  OpenAPISpec,
  SchemaObject,
  ExtractedEntity,
  EntityField,
  QueryParam,
  ExtractedOperation,
  ParameterObject,
  OperationObject,
  HttpMethod,
  CrudRole,
} from "./types.js";
import type { CrudEndpointPattern } from "../config/types.js";
import { toZodType } from "./zod-codegen.js";

type CrudPatterns = Partial<Record<CrudRole, CrudEndpointPattern>>;

/**
 * Extract entities from OpenAPI spec using tag-based grouping
 * and per-operation extraction.
 */
export function extractEntities(
  spec: OpenAPISpec,
  crudPatterns?: CrudPatterns,
): ExtractedEntity[] {
  const rawOps = collectAllOperations(spec);
  const tagGroups = groupByTag(rawOps);
  const entities: ExtractedEntity[] = [];

  for (const [_tag, ops] of tagGroups) {
    const subGroups = splitIntoEntities(ops);

    for (const group of subGroups) {
      const entity = buildEntityFromOps(spec, group, crudPatterns);
      if (entity) {
        entities.push(entity);
      }
    }
  }

  return deduplicateEntities(entities);
}

// --- Raw operation collection ---

interface RawOperation {
  path: string;
  method: HttpMethod;
  operation: OperationObject;
  pathItem: NonNullable<OpenAPISpec["paths"][string]>;
  tags: string[];
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const METHOD_KEYS = ["get", "post", "put", "patch", "delete"] as const;

function collectAllOperations(spec: OpenAPISpec): RawOperation[] {
  const ops: RawOperation[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;

    for (let i = 0; i < METHOD_KEYS.length; i++) {
      const key = METHOD_KEYS[i];
      const op = pathItem[key];
      if (!op) continue;

      ops.push({
        path,
        method: HTTP_METHODS[i],
        operation: op,
        pathItem,
        tags: op.tags ?? ["default"],
      });
    }
  }

  return ops;
}

// --- Tag-based grouping ---

function groupByTag(ops: RawOperation[]): Map<string, RawOperation[]> {
  const groups = new Map<string, RawOperation[]>();

  for (const op of ops) {
    // Use first tag as primary grouping key
    const tag = op.tags[0] ?? "default";
    const list = groups.get(tag) ?? [];
    list.push(op);
    groups.set(tag, list);
  }

  return groups;
}

// --- Entity splitting within a tag group ---

interface EntityGroup {
  basePath: string;
  resourceName: string;
  ops: RawOperation[];
  tag: string;
}

function splitIntoEntities(tagOps: RawOperation[]): EntityGroup[] {
  if (tagOps.length === 0) return [];

  const tag = tagOps[0].tags[0] ?? "default";

  // Find all unique base paths (path without trailing {param})
  const pathInfos = tagOps.map((op) => ({
    ...op,
    basePath: extractBasePath(op.path),
    segments: op.path.split("/").filter(Boolean),
  }));

  // Group by base path prefix to detect sub-resources
  const subGroups = new Map<string, RawOperation[]>();

  for (const info of pathInfos) {
    // Find the best matching base path for this operation
    const key = info.basePath;
    const list = subGroups.get(key) ?? [];
    list.push(info);
    subGroups.set(key, list);
  }

  // Merge sub-groups that share the same resource
  // e.g., /pet and /pet/{petId} should be the same entity
  const merged = mergeRelatedPaths(subGroups);

  return merged.map(([basePath, ops]) => ({
    basePath,
    resourceName: extractResourceName(basePath),
    ops,
    tag,
  }));
}

/**
 * Extract base path: the path up to the resource name (no trailing {param}).
 * Examples:
 *   /pet/{petId} → /pet
 *   /pet/findByStatus → /pet
 *   /pet/{petId}/uploadImage → /pet
 *   /store/order/{orderId} → /store/order
 *   /store/inventory → /store/inventory
 */
function extractBasePath(path: string): string {
  const segments = path.split("/").filter(Boolean);

  // Walk from the end, skip trailing params and sub-paths
  // Find the first non-param segment from the beginning that looks like a resource
  // Strategy: find the primary resource segment

  // Remove all trailing {param} segments to get the "collection" path
  let end = segments.length;
  while (end > 0 && isParam(segments[end - 1])) {
    end--;
  }

  // If the last non-param segment is an action (like uploadImage, findByStatus),
  // go up one more level
  if (end > 1 && !isParam(segments[end - 2])) {
    // Check if parent path contains a param - if so, this is a sub-action
    // e.g., /pet/{petId}/uploadImage → basePath should be /pet
    for (let i = end - 2; i >= 0; i--) {
      if (isParam(segments[i])) {
        // Found a param before the action segment - base path is up to the segment before the param
        return "/" + segments.slice(0, i).join("/");
      }
    }
  }

  // Default: use the path up to the last non-param segment
  if (end > 0) {
    return "/" + segments.slice(0, end).join("/");
  }
  return path;
}

function isParam(segment: string): boolean {
  return segment.startsWith("{") && segment.endsWith("}");
}

/**
 * Merge paths that belong to the same resource entity.
 * /pet, /pet/{petId}, /pet/findByStatus, /pet/{petId}/uploadImage → all under /pet
 */
function mergeRelatedPaths(
  subGroups: Map<string, RawOperation[]>,
): [string, RawOperation[]][] {
  const basePaths = [...subGroups.keys()].sort((a, b) => a.length - b.length);
  const merged = new Map<string, RawOperation[]>();
  const assigned = new Set<string>();

  for (const path of basePaths) {
    if (assigned.has(path)) continue;

    // Find a shorter base path that this path extends
    let parentBase: string | null = null;
    for (const candidate of basePaths) {
      if (candidate === path) continue;
      if (assigned.has(candidate)) continue;
      if (path.startsWith(candidate + "/") || path === candidate) {
        parentBase = candidate;
        break;
      }
    }

    // Also check if a merged path already exists that is a parent
    for (const mergedPath of merged.keys()) {
      if (path.startsWith(mergedPath + "/") || path === mergedPath) {
        parentBase = mergedPath;
        break;
      }
    }

    if (parentBase && merged.has(parentBase)) {
      merged.get(parentBase)!.push(...(subGroups.get(path) ?? []));
      assigned.add(path);
    } else {
      merged.set(path, [...(subGroups.get(path) ?? [])]);
      assigned.add(path);
    }
  }

  return [...merged.entries()];
}

function extractResourceName(basePath: string): string {
  const segments = basePath.split("/").filter(Boolean);
  // Return the last segment as the resource name
  return segments[segments.length - 1] ?? "resource";
}

// --- Build entity from operations ---

function buildEntityFromOps(
  spec: OpenAPISpec,
  group: EntityGroup,
  crudPatterns?: CrudPatterns,
): ExtractedEntity | null {
  if (group.ops.length === 0) return null;

  const { basePath, resourceName } = group;
  const name = toCamelCase(singularize(resourceName));
  const pascalName = toPascalCase(singularize(resourceName));
  const pluralName = resourceName;

  // Convert OpenAPI {param} to :param format in all paths
  const operations = group.ops.map((op) =>
    buildExtractedOperation(op, basePath, name, crudPatterns),
  );

  // Detect parent from the base path
  const parent = detectParentFromPath(basePath);

  // Extract schema
  const schema = extractEntitySchemaFromOps(spec, group.ops);
  const schemaOverride = buildSchemaOverride(schema);
  const fields = schemaToFields(schema);

  // Collect all query params from all operations
  const queryParams = collectQueryParams(group.ops);

  // Collect all tags
  const tagSet = new Set<string>();
  for (const op of group.ops) {
    for (const t of op.tags) {
      if (t !== "default") tagSet.add(t);
    }
  }

  return {
    name,
    pascalName,
    pluralName,
    path: convertPath(basePath),
    parent,
    fields,
    queryParams,
    operations,
    tags: [...tagSet],
    schemaOverride,
  };
}

/**
 * Build a schema override string for non-standard schemas (e.g., additionalProperties).
 * Returns undefined for standard object schemas with named properties.
 */
function buildSchemaOverride(schema: SchemaObject): string | undefined {
  // Handle additionalProperties (e.g., { additionalProperties: { type: "integer" } })
  if (
    schema.type === "object" &&
    !schema.properties &&
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    const valueType = toZodType(schema.additionalProperties);
    return `z.record(z.string(), ${valueType})`;
  }

  return undefined;
}

function buildExtractedOperation(
  raw: RawOperation,
  basePath: string,
  entityName: string,
  crudPatterns?: CrudPatterns,
): ExtractedOperation {
  const convertedPath = convertPath(raw.path);
  const role = crudPatterns
    ? matchCrudRole(raw.path, raw.method, basePath, crudPatterns)
    : undefined;
  const opName = role ?? deriveOperationName(raw, basePath, entityName);
  const hasInput = !!raw.operation.requestBody;

  // Extract body schema and content type
  const { bodySchema, contentType } = extractBodyInfo(raw);

  // Extract query params for this specific operation
  const params: ParameterObject[] = [
    ...(raw.pathItem.parameters ?? []),
    ...(raw.operation.parameters ?? []),
  ];
  const queryParams = params
    .filter((p) => p.in === "query")
    .map((p) => ({
      name: p.name,
      type: p.schema?.type ?? "string",
      required: p.required ?? false,
      description: p.description,
    }));

  return {
    name: opName,
    method: raw.method,
    path: convertedPath,
    role,
    hasInput,
    bodySchema,
    contentType,
    operationId: raw.operation.operationId,
    queryParams,
  };
}

function extractBodyInfo(
  raw: RawOperation,
): { bodySchema?: SchemaObject; contentType?: "json" | "multipart" } {
  const content = raw.operation.requestBody?.content;
  if (!content) return {};

  // Detect content type
  const isMultipart = !!content["multipart/form-data"];
  const contentType: "json" | "multipart" | undefined = isMultipart
    ? "multipart"
    : content["application/json"]
      ? "json"
      : undefined;

  // Always extract body schema from requestBody
  const mediaType = content["application/json"] ?? content["multipart/form-data"];
  const bodySchema = mediaType?.schema;

  return { bodySchema, contentType };
}

/**
 * Match CRUD role from config-driven patterns.
 * Returns the first matching role, or undefined if no pattern matches.
 */
function matchCrudRole(
  path: string,
  method: HttpMethod,
  basePath: string,
  crudPatterns: CrudPatterns,
): CrudRole | undefined {
  const relativePath = path === basePath ? "/" : path.slice(basePath.length);

  for (const [role, pattern] of Object.entries(crudPatterns)) {
    if (!pattern) continue;
    const methods = Array.isArray(pattern.method) ? pattern.method : [pattern.method];
    if (!methods.includes(method)) continue;

    const paths = Array.isArray(pattern.path) ? pattern.path : [pattern.path];
    for (const p of paths) {
      if (matchPathPattern(relativePath, p)) {
        return role as CrudRole;
      }
    }
  }

  return undefined;
}

/**
 * Segment-based path pattern matching.
 * - `:param` → matches only path parameter segments ({...} or :... format)
 * - `*` → matches any single segment (wildcard)
 * - literal → exact match
 */
function matchPathPattern(relativePath: string, pattern: string): boolean {
  const pathSegs = relativePath.split("/").filter(Boolean);
  const patternSegs = pattern.split("/").filter(Boolean);

  if (pathSegs.length !== patternSegs.length) return false;

  for (let i = 0; i < patternSegs.length; i++) {
    const pSeg = patternSegs[i];
    const aSeg = pathSegs[i];

    if (pSeg === "*") continue;
    if (pSeg.startsWith(":")) {
      if (!isParam(aSeg)) return false;
    } else {
      if (pSeg !== aSeg) return false;
    }
  }

  return true;
}

/**
 * Derive a custom operation name from operationId or path.
 */
function deriveOperationName(
  raw: RawOperation,
  basePath: string,
  entityName: string,
): string {
  // Try operationId first
  if (raw.operation.operationId) {
    return cleanOperationId(raw.operation.operationId, entityName);
  }

  // Fall back to path-based name
  return deriveNameFromPath(raw.path, raw.method, basePath);
}

const CRUD_KEYWORDS = new Set(["get", "list", "create", "update", "delete"]);

/**
 * Clean operationId: convert to camelCase, strip entity name prefix.
 * Examples:
 *   findPetsByStatus → findByStatus
 *   uploadFile → uploadFile
 *   addPet → addPet (but if role is detected as create, name will be "create")
 *   getInventory → inventory (CRUD keyword after stripping → use entity name)
 */
function cleanOperationId(
  operationId: string,
  entityName: string,
): string {
  let name = toCamelCase(operationId);

  // Strip entity-related prefixes
  const pascalEntity = toPascalCase(entityName);
  const pluralPascal = toPascalCase(entityName + "s");

  // findPetsByStatus → findByStatus
  if (name.includes(pluralPascal)) {
    name = name.replace(pluralPascal, "");
    if (name.startsWith("find")) {
      name = "find" + name.slice(4);
    }
  }

  // getPetById → getById (but this is typically handled by role detection)
  if (name.includes(pascalEntity)) {
    const stripped = name.replace(pascalEntity, "");
    const cleaned = stripped.length > 0
      ? stripped.charAt(0).toLowerCase() + stripped.slice(1)
      : "";
    // If stripping entity name leaves a bare CRUD keyword, use entity name instead
    // e.g., getInventory → "get" → use "inventory"
    if (CRUD_KEYWORDS.has(cleaned)) {
      return entityName;
    }
    name = stripped;
  }

  // Clean up: ensure starts with lowercase
  if (name.length > 0) {
    name = name.charAt(0).toLowerCase() + name.slice(1);
  }

  // Handle edge cases where name becomes empty or just a preposition
  if (!name || name === "by" || name === "s") {
    return toCamelCase(operationId);
  }

  return name;
}

/**
 * Derive operation name from path when no operationId is available.
 * /pet/findByStatus → findByStatus
 * /pet/{petId}/uploadImage → uploadImage
 */
function deriveNameFromPath(
  path: string,
  method: HttpMethod,
  basePath: string,
): string {
  // Get the sub-path after the base path
  let subPath = path;
  if (path.startsWith(basePath)) {
    subPath = path.slice(basePath.length);
  }

  const segments = subPath.split("/").filter(Boolean);
  // Skip {param} segments
  const meaningful = segments.filter((s) => !isParam(s));

  if (meaningful.length > 0) {
    return toCamelCase(meaningful.join("-"));
  }

  // Fallback: method-based name
  return method.toLowerCase();
}

// --- Path conversion ---

/**
 * Convert OpenAPI {param} to :param format.
 */
function convertPath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, ":$1");
}

// --- Schema extraction ---

function extractEntitySchemaFromOps(
  spec: OpenAPISpec,
  ops: RawOperation[],
): SchemaObject {
  // Priority: GET item → GET list → any 2xx response → empty
  const getItem = ops.find(
    (op) => op.method === "GET" && hasPathParam(op.path),
  );
  if (getItem) {
    const schema = extractResponseSchema(spec, getItem.path, "get");
    if (schema?.properties) return schema;
  }

  const getList = ops.find(
    (op) => op.method === "GET" && !hasPathParam(op.path),
  );
  if (getList) {
    const schema = extractResponseSchema(spec, getList.path, "get");
    if (schema) {
      const unwrapped = unwrapListSchema(schema);
      if (unwrapped) return unwrapped;
      // Handle non-standard schemas (e.g., additionalProperties map)
      if (isNonStandardSchema(schema)) return schema;
    }
  }

  // Any 2xx response from any operation
  for (const op of ops) {
    const schema = extractResponseSchema(spec, op.path, methodToKey(op.method));
    if (schema?.properties) return schema;
  }

  // No schema found
  return { type: "object" };
}

function isNonStandardSchema(schema: SchemaObject): boolean {
  return (
    schema.type === "object" &&
    !schema.properties &&
    !!schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  );
}

function hasPathParam(path: string): boolean {
  return path.includes("{");
}

function unwrapListSchema(schema: SchemaObject): SchemaObject | undefined {
  if (schema.type === "array" && schema.items?.properties) {
    return schema.items;
  }
  if (
    schema.properties?.data?.type === "array" &&
    schema.properties.data.items?.properties
  ) {
    return schema.properties.data.items;
  }
  if (
    schema.properties?.items?.type === "array" &&
    schema.properties.items.items?.properties
  ) {
    return schema.properties.items.items;
  }
  return undefined;
}


function extractResponseSchema(
  spec: OpenAPISpec,
  path: string,
  method: "get" | "post" | "put" | "patch" | "delete",
): SchemaObject | undefined {
  const pathItem = spec.paths[path];
  const op = pathItem?.[method];
  if (!op?.responses) return undefined;

  for (const code of Object.keys(op.responses)) {
    if (!code.startsWith("2")) continue;
    const response = op.responses[code];
    const schema = response?.content?.["application/json"]?.schema;
    if (schema) return schema;
  }

  return undefined;
}

function methodToKey(method: HttpMethod): "get" | "post" | "put" | "patch" | "delete" {
  return method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete";
}

function collectQueryParams(ops: RawOperation[]): QueryParam[] {
  const seen = new Set<string>();
  const result: QueryParam[] = [];

  for (const op of ops) {
    const params: ParameterObject[] = [
      ...(op.pathItem.parameters ?? []),
      ...(op.operation.parameters ?? []),
    ];

    for (const p of params) {
      if (p.in === "query" && !seen.has(p.name)) {
        seen.add(p.name);
        result.push({
          name: p.name,
          type: p.schema?.type ?? "string",
          required: p.required ?? false,
          description: p.description,
        });
      }
    }
  }

  return result;
}

function detectParentFromPath(
  basePath: string,
): { param: string; path: string } | undefined {
  const segments = basePath.split("/").filter(Boolean);

  for (let i = segments.length - 1; i >= 1; i--) {
    const seg = segments[i];
    if (isParam(seg)) {
      const paramName = seg.slice(1, -1);
      const parentPath = "/" + segments.slice(0, i).join("/");
      return { param: paramName, path: parentPath };
    }
  }

  return undefined;
}

// --- Schema to fields ---

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
      required: isRequired,
      nullable: isNullable,
      default: prop.default,
      enum: prop.enum,
    });
  }

  return fields;
}

// --- Deduplication ---

function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const map = new Map<string, ExtractedEntity>();

  for (const entity of entities) {
    const existing = map.get(entity.name);
    if (existing) {
      // Merge operations
      const opNames = new Set(existing.operations.map((o) => o.name));
      for (const op of entity.operations) {
        if (!opNames.has(op.name)) {
          existing.operations.push(op);
          opNames.add(op.name);
        }
      }
      // Merge tags
      const tagSet = new Set([...existing.tags, ...entity.tags]);
      existing.tags = [...tagSet];
    } else {
      map.set(entity.name, entity);
    }
  }

  return [...map.values()];
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

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
