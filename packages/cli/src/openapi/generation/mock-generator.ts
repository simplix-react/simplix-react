import { join } from "node:path";
import { writeFileWithDir, pathExists } from "../../utils/fs.js";
import { toPascalCase } from "../../utils/case.js";
import { generateOrvalSeedFile } from "./seed-generator.js";
import type { ResponseAdapterConfig, ResponseAdapterPreset } from "../adaptation/response-adapter.js";
import { getResponseAdapterPreset } from "../plugin-registry.js";
import type { CrudRole, ExtractedEntity, ExtractedOperation } from "../types.js";

// ── Types ────────────────────────────────────────────────────

interface MockResolvedOperation {
  entity: ExtractedEntity;
  operation: ExtractedOperation;
  role: string | undefined;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Generates mock files for an Orval domain package:
 * - `mock/seeds.ts` — typed seed arrays (only on first creation)
 * - `mock/index.ts` — store + inline MSW handler wiring (always regenerated)
 *
 * When `responseAdapter` is a preset (e.g., "boot"), wraps mock responses with
 * the preset's mockResponseWrapper to match the expected API envelope format.
 */
export async function generateMockFiles(
  targetDir: string,
  domainName: string,
  entities: ExtractedEntity[],
  responseAdapter?: ResponseAdapterConfig,
): Promise<void> {
  // 1. Generate seeds.ts if it doesn't exist
  const seedsPath = join(targetDir, "src/mock/seeds.ts");
  const validEntities = entities.filter((e) => e.fields.length > 0);

  if (!(await pathExists(seedsPath)) && validEntities.length > 0) {
    const seedContent = generateOrvalSeedFile(entities);
    if (seedContent) {
      await writeFileWithDir(seedsPath, seedContent);
    }
  }

  // 2. Collect all operations across entities
  const allOps = collectOperations(entities);
  if (allOps.length === 0) return;

  // 3. Generate mock/index.ts
  const hasSeedsFile = await pathExists(seedsPath);
  const preset = resolveAdapterPreset(responseAdapter);
  const content = generateMockIndexCode(domainName, validEntities, allOps, hasSeedsFile, preset);
  await writeFileWithDir(join(targetDir, "src/mock/index.ts"), content);
}

/**
 * Resolve a ResponseAdapterConfig to its preset (if it's a known preset string).
 * Returns undefined for "raw", object configs, or unknown preset names.
 */
function resolveAdapterPreset(
  adapter?: ResponseAdapterConfig,
): ResponseAdapterPreset | undefined {
  if (!adapter || adapter === "raw" || typeof adapter !== "string") {
    return undefined;
  }
  return getResponseAdapterPreset(adapter);
}

// ── Collector ────────────────────────────────────────────────

function collectOperations(entities: ExtractedEntity[]): MockResolvedOperation[] {
  const result: MockResolvedOperation[] = [];
  const seen = new Set<string>();

  for (const entity of entities) {
    for (const op of entity.operations) {
      const key = `${op.method}:${op.path}`;
      if (seen.has(key)) continue;
      seen.add(key);

      result.push({
        entity,
        operation: op,
        role: op.role ?? inferRole(op, entity),
      });
    }
  }

  return result;
}

// ── Code Generator ───────────────────────────────────────────

function generateMockIndexCode(
  domainName: string,
  validEntities: ExtractedEntity[],
  ops: MockResolvedOperation[],
  hasSeedsFile: boolean,
  adapterPreset?: ResponseAdapterPreset,
): string {
  const imports: string[] = [
    'import { http, HttpResponse } from "msw";',
    'import type { MockDomainConfig } from "@simplix-react/mock";',
  ];

  // Add response wrapper import if adapter preset has one
  if (adapterPreset?.mockResponseWrapperImport) {
    imports.push(adapterPreset.mockResponseWrapperImport);
  }

  // Only create stores for entities with standard CRUD operations
  const CRUD_STORE_ROLES = new Set([
    "list", "search", "get", "create", "update", "delete",
    "batchDelete", "batchUpdate", "multiUpdate", "getForEdit", "tree", "subtree",
  ]);
  const storeEntities = validEntities.filter((entity) =>
    entity.operations.some((op) => {
      const role = op.role ?? inferRole(op, entity);
      return CRUD_STORE_ROLES.has(role);
    }),
  );
  const hasStores = storeEntities.length > 0 && hasSeedsFile;

  if (hasStores) {
    const hasTreeOps = ops.some((o) => o.role === "tree");
    const mockImports = ["createMockEntityStore"];
    if (hasTreeOps) mockImports.push("buildEmbeddedTree");
    imports.push(`import { ${mockImports.join(", ")} } from "@simplix-react/mock";`);
    const typeNames = storeEntities.map((e) => e.modelType ?? e.pascalName).join(", ");
    imports.push(`import type { ${typeNames} } from "../generated/model";`);
    const seedNames = storeEntities.map((e) => `${e.name}Seeds`).join(", ");
    imports.push(`import { ${seedNames} } from "./seeds";`);
  }

  // Store declarations
  const storeDecls: string[] = [];
  if (hasStores) {
    for (const entity of storeEntities) {
      const typeName = entity.modelType ?? entity.pascalName;
      const idField = findIdField(entity);
      const idArg = idField !== "id" ? `, "${idField}"` : "";
      storeDecls.push(
        `const ${entity.name}Store = createMockEntityStore<${typeName}>(${entity.name}Seeds${idArg});`,
      );
    }
  }

  // Sort: literal paths before parameterized paths (prevent MSW route shadowing)
  const sortedOps = [...ops].sort((a, b) => {
    const aHasParam = a.operation.path.includes(":");
    const bHasParam = b.operation.path.includes(":");
    if (aHasParam === bHasParam) return 0;
    return aHasParam ? 1 : -1;
  });

  const handlerEntries: string[] = [];
  const wrapFn = adapterPreset?.mockResponseWrapper;
  for (const { entity, operation, role } of sortedOps) {
    const hasStore = hasStores && storeEntities.some((e) => e.name === entity.name);
    const entry = generateHandlerEntry(entity, operation, role, hasStore, wrapFn);
    handlerEntries.push(entry);
  }

  // Reset calls
  const resetCalls: string[] = [];
  if (hasStores) {
    for (const entity of storeEntities) {
      resetCalls.push(`  ${entity.name}Store.reset();`);
    }
  }

  // Assemble
  const lines: string[] = [
    ...imports,
    "",
  ];

  if (storeDecls.length > 0) {
    lines.push(...storeDecls, "");
  }

  lines.push(
    `export function create${toPascalCase(domainName)}Mock(): MockDomainConfig {`,
  );

  if (resetCalls.length > 0) {
    lines.push(...resetCalls, "");
  }

  lines.push(
    "  return {",
    `    name: "${domainName}",`,
    "    handlers: [",
    ...handlerEntries,
    "    ],",
    "  };",
    "}",
    "",
  );

  return lines.join("\n");
}

// ── Handler Entry ────────────────────────────────────────────

function generateHandlerEntry(
  entity: ExtractedEntity,
  operation: ExtractedOperation,
  role: string | undefined,
  hasStore: boolean,
  wrapFn?: string,
): string {
  const method = operation.method.toLowerCase();
  const pattern = toMswPattern(operation.path);
  const isVoid = operation.method === "DELETE";

  if (!hasStore || !role) {
    const emptyBody = wrapFn ? `${wrapFn}({})` : "{}";
    return `      http.${method}("${pattern}", () => HttpResponse.json(${emptyBody})),`;
  }

  const store = `${entity.name}Store`;
  const idField = findIdField(entity);
  const pathParam = extractPathParam(operation.path);
  const isNumericId = isIdFieldNumeric(entity);
  const paramIsIdField = !pathParam || isPathParamIdField(pathParam, idField);

  const typeName = entity.modelType ?? entity.pascalName;
  let entry: string;
  switch (role) {
    case "list":
      entry = generateListHandler(method, pattern, store, operation);
      break;
    case "get":
      entry = paramIsIdField
        ? generateReadHandler(method, pattern, store, pathParam, isNumericId)
        : generateReadByFieldHandler(method, pattern, store, pathParam!);
      break;
    case "create":
      entry = generateCreateHandler(method, pattern, store, typeName, isVoid);
      break;
    case "update":
      entry = paramIsIdField
        ? generateUpdateHandler(method, pattern, store, typeName, pathParam, idField, isNumericId, isVoid)
        : generateUpdateByFieldHandler(method, pattern, store, typeName, pathParam!, isVoid);
      break;
    case "delete":
      entry = paramIsIdField
        ? generateDeleteHandler(method, pattern, store, pathParam, isNumericId)
        : generateDeleteByFieldHandler(method, pattern, store, pathParam!);
      break;
    case "multiUpdate":
    case "batchUpdate":
      entry = generateUpdateHandler(method, pattern, store, typeName, undefined, idField, isNumericId, isVoid);
      break;
    case "getForEdit": {
      // getForEdit has a path like /:id/edit — extract the param from the parent segment
      const parentParam = extractParentPathParam(operation.path);
      const parentIsIdField = !parentParam || isPathParamIdField(parentParam, idField);
      entry = parentIsIdField
        ? generateReadHandler(method, pattern, store, parentParam, isNumericId)
        : generateReadByFieldHandler(method, pattern, store, parentParam!);
      break;
    }
    case "batchDelete":
      entry = `      http.${method}("${pattern}", () => HttpResponse.json({})),`;
      break;
    case "search":
      entry = generateSearchHandler(method, pattern, store);
      break;
    case "order":
      entry = generateOrderHandler(method, pattern, store, entity, operation);
      break;
    case "tree":
      entry = generateTreeHandler(method, pattern, store, entity);
      break;
    case "subtree": {
      const subtreeParam = extractPathParam(operation.path);
      entry = paramIsIdField
        ? generateReadHandler(method, pattern, store, subtreeParam, isNumericId)
        : generateReadByFieldHandler(method, pattern, store, subtreeParam!);
      break;
    }
    default: {
      const emptyBody = wrapFn ? `${wrapFn}({})` : "{}";
      return `      http.${method}("${pattern}", () => HttpResponse.json(${emptyBody})),`;
    }
  }

  // Wrap HttpResponse.json() payloads with the adapter wrapper function
  if (wrapFn) {
    entry = wrapJsonPayloads(entry, wrapFn);
  }

  return entry;
}

// ── Role-specific handlers ───────────────────────────────────

function generateListHandler(
  method: string,
  pattern: string,
  store: string,
  operation: ExtractedOperation,
): string {
  const filterParams = operation.queryParams.filter((qp) => qp.type === "string");
  const filterParam = filterParams.length > 0 ? filterParams[0] : undefined;

  const lines = [
    `      http.${method}("${pattern}", ({ request }) => {`,
    `        const url = new URL(request.url);`,
  ];

  if (filterParam) {
    const varName = sanitizeVarName(filterParam.name);
    const fieldName = sanitizeFieldName(filterParam.name);
    lines.push(
      `        const ${varName} = url.searchParams.get("${filterParam.name}");`,
      `        if (${varName}) return HttpResponse.json(${store}.filter((item) => item.${fieldName} === ${varName}));`,
    );
  }

  lines.push(
    `        const page = Number(url.searchParams.get("page") ?? "0");`,
    `        const size = Number(url.searchParams.get("size") ?? "10");`,
    `        const sort = url.searchParams.get("sort") ?? undefined;`,
    `        return HttpResponse.json(${store}.listPaged(page, size, sort));`,
    `      }),`,
  );

  return lines.join("\n");
}

function generateReadHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string | undefined,
  isNumericId: boolean,
): string {
  if (!pathParam) {
    return `      http.${method}("${pattern}", () => HttpResponse.json(${store}.list()[0])),`;
  }

  const idExpr = isNumericId
    ? `Number(params.${pathParam})`
    : `String(params.${pathParam})`;

  return `      http.${method}("${pattern}", ({ params }) => HttpResponse.json(${store}.getById(${idExpr}) ?? ${store}.list()[0])),`;
}

function generateReadByFieldHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string,
): string {
  return `      http.${method}("${pattern}", ({ params }) => HttpResponse.json(${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0] ?? ${store}.list()[0])),`;
}

function generateSearchHandler(
  method: string,
  pattern: string,
  store: string,
): string {
  const lines = [
    `      http.${method}("${pattern}", ({ request }) => {`,
    `        const url = new URL(request.url);`,
    `        const page = Number(url.searchParams.get("page") ?? "0");`,
    `        const size = Number(url.searchParams.get("size") ?? "10");`,
    `        const sort = url.searchParams.get("sort") ?? undefined;`,
    `        return HttpResponse.json(${store}.listPaged(page, size, sort));`,
    `      }),`,
  ];
  return lines.join("\n");
}

function generateOrderHandler(
  method: string,
  pattern: string,
  store: string,
  entity: ExtractedEntity,
  operation: ExtractedOperation,
): string {
  const orderField = findOrderField(operation, entity);
  const idField = findIdField(entity);
  const lines = [
    `      http.${method}("${pattern}", async ({ request }) => {`,
    `        const items = await request.json() as { ${idField}: string | number; ${orderField}: number }[];`,
    `        for (const item of items) ${store}.update(item.${idField}, { ${orderField}: item.${orderField} } as never);`,
    `        return HttpResponse.json({});`,
    `      }),`,
  ];
  return lines.join("\n");
}

function generateTreeHandler(
  method: string,
  pattern: string,
  store: string,
  entity: ExtractedEntity,
): string {
  const idField = findIdField(entity);
  const parentField = findParentIdField(entity);
  const args: string[] = [`${store}.list()`];
  if (idField !== "id") args.push(`"${idField}"`);
  if (parentField !== "parentId") {
    if (idField === "id") args.push(`"id"`);
    args.push(`"${parentField}"`);
  }
  return `      http.${method}("${pattern}", () => HttpResponse.json(buildEmbeddedTree(${args.join(", ")}))),`;
}

/** Sanitize a param name to a valid JS variable name (e.g., "userId.equals" → "userId_equals") */
function sanitizeVarName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_$]/g, "_");
}

/** Extract the field name from a query param (e.g., "userId.equals" → "userId") */
function sanitizeFieldName(name: string): string {
  const dotIdx = name.indexOf(".");
  return dotIdx >= 0 ? name.slice(0, dotIdx) : name;
}

function generateCreateHandler(
  method: string,
  pattern: string,
  store: string,
  pascalName: string,
  isVoid: boolean,
): string {
  if (isVoid) {
    return `      http.${method}("${pattern}", async ({ request }) => { ${store}.create(await request.json() as ${pascalName}); return new HttpResponse(null, { status: 204 }); }),`;
  }
  return `      http.${method}("${pattern}", async ({ request }) => HttpResponse.json(${store}.create(await request.json() as ${pascalName}))),`;
}

function generateUpdateHandler(
  method: string,
  pattern: string,
  store: string,
  pascalName: string,
  pathParam: string | undefined,
  idField: string,
  isNumericId: boolean,
  isVoid: boolean,
): string {
  if (pathParam) {
    const idExpr = isNumericId
      ? `Number(params.${pathParam})`
      : `String(params.${pathParam})`;
    if (isVoid) {
      return `      http.${method}("${pattern}", async ({ request, params }) => { ${store}.update(${idExpr}, await request.json() as ${pascalName}); return new HttpResponse(null, { status: 204 }); }),`;
    }
    return `      http.${method}("${pattern}", async ({ request, params }) => HttpResponse.json(${store}.update(${idExpr}, await request.json() as ${pascalName}))),`;
  }

  // Body-based update (PUT /pet — no path param)
  if (isVoid) {
    const lines = [
      `      http.${method}("${pattern}", async ({ request }) => {`,
      `        const body = await request.json() as ${pascalName};`,
      `        ${store}.update(body.${idField}!, body) ?? ${store}.create(body);`,
      `        return new HttpResponse(null, { status: 204 });`,
      `      }),`,
    ];
    return lines.join("\n");
  }
  const lines = [
    `      http.${method}("${pattern}", async ({ request }) => {`,
    `        const body = await request.json() as ${pascalName};`,
    `        return HttpResponse.json(${store}.update(body.${idField}!, body) ?? ${store}.create(body));`,
    `      }),`,
  ];
  return lines.join("\n");
}

function generateUpdateByFieldHandler(
  method: string,
  pattern: string,
  store: string,
  pascalName: string,
  pathParam: string,
  isVoid: boolean,
): string {
  if (isVoid) {
    const lines = [
      `      http.${method}("${pattern}", async ({ request, params }) => {`,
      `        const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
      `        if (item) ${store}.update(item.id as string | number, await request.json() as ${pascalName});`,
      `        return new HttpResponse(null, { status: 204 });`,
      `      }),`,
    ];
    return lines.join("\n");
  }
  const lines = [
    `      http.${method}("${pattern}", async ({ request, params }) => {`,
    `        const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
    `        if (!item) return HttpResponse.json(${store}.list()[0]);`,
    `        return HttpResponse.json(${store}.update(item.id as string | number, await request.json() as ${pascalName}));`,
    `      }),`,
  ];
  return lines.join("\n");
}

function generateDeleteHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string | undefined,
  isNumericId: boolean,
): string {
  if (!pathParam) {
    return `      http.${method}("${pattern}", () => HttpResponse.json(null)),`;
  }

  const idExpr = isNumericId
    ? `Number(params.${pathParam})`
    : `String(params.${pathParam})`;

  return `      http.${method}("${pattern}", ({ params }) => { ${store}.remove(${idExpr}); return HttpResponse.json(null); }),`;
}

function generateDeleteByFieldHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string,
): string {
  const lines = [
    `      http.${method}("${pattern}", ({ params }) => {`,
    `        const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
    `        if (item) ${store}.remove(item.id as string | number);`,
    `        return HttpResponse.json(null);`,
    `      }),`,
  ];
  return lines.join("\n");
}

// ── Response Wrapper ─────────────────────────────────────────

/**
 * Wrap `HttpResponse.json(expr)` payloads with a wrapper function.
 * e.g., `HttpResponse.json(store.list())` → `HttpResponse.json(wrapFn(store.list()))`
 *
 * Uses balanced parenthesis matching to handle nested expressions like
 * `HttpResponse.json(store.create(await request.json() as Pet))`.
 *
 * Only wraps `HttpResponse.json(...)` calls; `new HttpResponse(...)` is left unchanged.
 */
function wrapJsonPayloads(code: string, wrapFn: string): string {
  const marker = "HttpResponse.json(";
  let result = "";
  let pos = 0;

  while (pos < code.length) {
    const idx = code.indexOf(marker, pos);
    if (idx === -1) {
      result += code.slice(pos);
      break;
    }

    result += code.slice(pos, idx) + marker + wrapFn + "(";
    const start = idx + marker.length;
    let depth = 1;
    let i = start;

    while (i < code.length && depth > 0) {
      if (code[i] === "(") depth++;
      else if (code[i] === ")") depth--;
      i++;
    }

    // i now points past the closing ')' of HttpResponse.json(...)
    // The payload is code[start..i-2], the closing ')' is at i-1
    result += code.slice(start, i - 1) + ")";  // close wrapFn(...)
    pos = i - 1;  // continue from the closing ')' of HttpResponse.json
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────

function toMswPattern(path: string): string {
  return `*${path}`;
}

function findIdField(entity: ExtractedEntity): string {
  // Exact "id" field
  const exact = entity.fields.find((f) => f.name.toLowerCase() === "id");
  if (exact) return exact.name;
  // Fields ending with "Id" (camelCase, e.g., userId, accountId)
  const idLike = entity.fields.find((f) => /[A-Z]?[Ii]d$/.test(f.name));
  if (idLike) return idLike.name;
  return "id";
}

function isIdFieldNumeric(entity: ExtractedEntity): boolean {
  const idFieldName = findIdField(entity);
  const field = entity.fields.find((f) => f.name === idFieldName);
  return field ? field.type === "integer" || field.type === "number" : true;
}

/**
 * Determine if a path param represents the entity's ID field.
 * - "petId" → maps to "id" ✓
 * - "orderId" → maps to "id" ✓
 * - "username" → does NOT map to "id" ✗
 */
function isPathParamIdField(pathParam: string, idField: string): boolean {
  if (pathParam === idField) return true;
  return pathParam.toLowerCase().endsWith("id");
}

function extractPathParam(path: string): string | undefined {
  const match = path.match(/:(\w+)$/);
  return match ? match[1] : undefined;
}

/** Extract path param from a parent segment (e.g., "/:userId/edit" → "userId") */
function extractParentPathParam(path: string): string | undefined {
  const match = path.match(/:(\w+)\/[^/]+$/);
  return match ? match[1] : undefined;
}

function findOrderField(operation: ExtractedOperation, entity: ExtractedEntity): string {
  // 1. Check bodySchema items properties for a non-id field
  const props = operation.bodySchema?.items?.properties;
  if (props) {
    const nonIdField = Object.keys(props).find((k) => k.toLowerCase() !== "id" && !k.toLowerCase().endsWith("id"));
    if (nonIdField) return nonIdField;
  }

  // 2. Fallback: scan entity fields for known order field names
  const orderNames = ["displayOrder", "sortOrder", "orderIndex"];
  for (const name of orderNames) {
    if (entity.fields.some((f) => f.name === name)) return name;
  }

  return "displayOrder";
}

function findParentIdField(entity: ExtractedEntity): string {
  // Exact "parentId"
  if (entity.fields.some((f) => f.name === "parentId")) return "parentId";
  // Fields matching *parent*id pattern
  const parentLike = entity.fields.find((f) => /parent.*id/i.test(f.name));
  if (parentLike) return parentLike.name;
  return "parentId";
}

/**
 * Infer CRUD role from HTTP method + path when explicit role is not set.
 *
 * Operation paths are absolute (e.g. "/pet", "/pet/:petId"), so we compare
 * against the entity's base path to determine if it's a collection or item endpoint.
 */
function inferRole(op: ExtractedOperation, entity: ExtractedEntity): CrudRole | undefined {
  const basePath = entity.path;
  const suffix = op.path.slice(basePath.length);
  const isBasePath = suffix === "" || suffix === "/";
  const hasPathParam = /:(\w+)/.test(suffix);
  const isItemPath = hasPathParam && !suffix.includes("/", 2);

  switch (op.method) {
    case "GET":
      if (isItemPath) return "get";
      if (isBasePath || suffix === "/search") return "list";
      if (/^\/:[^/]+\/edit$/.test(suffix)) return "getForEdit";
      if (suffix === "/tree") return "tree";
      if (/^\/tree\/:[^/]+$/.test(suffix)) return "subtree";
      // Sub-path with query params → likely a filter/search endpoint
      if (op.queryParams.length > 0) return "list";
      return undefined;
    case "POST":
      if (isBasePath || suffix === "/create") return "create";
      if (suffix === "/search") return "search";
      return undefined;
    case "PUT":
      if (isItemPath) return "update";
      return "update";
    case "PATCH":
      if (isItemPath) return "update";
      if (isBasePath) return "multiUpdate";
      if (suffix === "/batch") return "batchUpdate";
      if (suffix === "/order") return "order";
      return "update";
    case "DELETE":
      if (isItemPath) return "delete";
      if (isBasePath || suffix === "/batch") return "batchDelete";
      return undefined;
    default:
      return undefined;
  }
}
