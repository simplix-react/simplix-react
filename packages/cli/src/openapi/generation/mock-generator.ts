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
 * - `mock/seeds.ts`              — typed seed arrays (only on first creation)
 * - `generated/mock/handlers.ts` — per-entity MSW handler factories (always regenerated)
 * - `mock/index.ts`              — store wiring + user overrides (only on first creation)
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

  // 3. Resolve adapter preset
  const hasSeedsFile = await pathExists(seedsPath);
  const preset = resolveAdapterPreset(responseAdapter);

  // Determine which entities get stores
  const storeEntities = validEntities.filter((entity) =>
    entity.operations.some((op) => {
      const role = op.role ?? inferRole(op, entity);
      return CRUD_STORE_ROLES.has(<string>role);
    }),
  );
  const hasStores = storeEntities.length > 0 && hasSeedsFile;

  // Group operations by entity name
  const sortedOps = sortOps(allOps);
  const opsByEntity = groupOpsByEntity(sortedOps);

  // 4. Always regenerate generated/mock/handlers.ts
  const handlersContent = generateHandlersFileCode(
    storeEntities, opsByEntity, hasStores, preset,
  );
  await writeFileWithDir(join(targetDir, "src/generated/mock/handlers.ts"), handlersContent);

  // 5. Generate mock/index.ts only on first creation
  const entryPath = join(targetDir, "src/mock/index.ts");
  if (!(await pathExists(entryPath))) {
    const entryContent = generateMockEntryCode(
      domainName, storeEntities, hasStores, preset,
    );
    await writeFileWithDir(entryPath, entryContent);
  }
}

// ── Constants ────────────────────────────────────────────────

const CRUD_STORE_ROLES = new Set([
  "list", "getAll", "search", "get", "create", "update", "delete",
  "batchDelete", "batchUpdate", "multiUpdate", "getForEdit", "tree", "subtree",
]);

// ── Resolver ─────────────────────────────────────────────────

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

function sortOps(ops: MockResolvedOperation[]): MockResolvedOperation[] {
  return [...ops].sort((a, b) => {
    const aHasParam = a.operation.path.includes(":");
    const bHasParam = b.operation.path.includes(":");
    if (aHasParam === bHasParam) return 0;
    return aHasParam ? 1 : -1;
  });
}

function groupOpsByEntity(ops: MockResolvedOperation[]): Map<string, MockResolvedOperation[]> {
  const map = new Map<string, MockResolvedOperation[]>();
  for (const op of ops) {
    const key = op.entity.name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(op);
  }
  return map;
}

// ── generated/mock/handlers.ts ──────────────────────────────

function generateHandlersFileCode(
  storeEntities: ExtractedEntity[],
  opsByEntity: Map<string, MockResolvedOperation[]>,
  hasStores: boolean,
  adapterPreset?: ResponseAdapterPreset,
): string {
  const wrapFn = adapterPreset?.mockResponseWrapper;
  const hasTreeOps = [...opsByEntity.values()].flat().some((o) => o.role === "tree");

  // Imports
  const imports: string[] = [
    'import { http, HttpResponse } from "msw";',
  ];

  if (adapterPreset?.mockResponseWrapperImport) {
    imports.push(adapterPreset.mockResponseWrapperImport);
  }

  if (hasStores) {
    imports.push(`import type { MockEntityStore } from "@simplix-react/mock";`);
    if (hasTreeOps) {
      imports.push(`import { buildEmbeddedTree } from "@simplix-react/mock";`);
    }

    const typeNames = storeEntities.map((e) => e.modelType ?? e.pascalName).join(", ");
    imports.push(`import type { ${typeNames} } from "../model";`);
  }

  // Entity handler functions
  const functions: string[] = [];
  for (const entity of storeEntities) {
    const entityOps = opsByEntity.get(entity.name) ?? [];
    if (entityOps.length === 0) continue;

    const typeName = entity.modelType ?? entity.pascalName;
    const fnName = `create${entity.pascalName}Handlers`;

    const handlerEntries: string[] = [];
    for (const { entity: ent, operation, role } of entityOps) {
      const entry = generateHandlerEntry(ent, operation, role, hasStores, wrapFn, "store");
      handlerEntries.push(entry);
    }

    functions.push([
      `export function ${fnName}(store: MockEntityStore<${typeName}>) {`,
      `  return [`,
      ...handlerEntries,
      `  ];`,
      `}`,
    ].join("\n"));
  }

  return [
    ...imports,
    "",
    ...functions.map((f) => f + "\n"),
  ].join("\n");
}

// ── mock/index.ts (one-time) ────────────────────────────────

function generateMockEntryCode(
  domainName: string,
  storeEntities: ExtractedEntity[],
  hasStores: boolean,
  adapterPreset?: ResponseAdapterPreset,
): string {
  const imports: string[] = [
    'import type { MockDomainConfig } from "@simplix-react/mock";',
  ];

  if (hasStores) {
    imports.push('import { createMockEntityStore } from "@simplix-react/mock";');

    const typeNames = storeEntities.map((e) => e.modelType ?? e.pascalName).join(", ");
    imports.push(`import type { ${typeNames} } from "../generated/model";`);

    const seedNames = storeEntities.map((e) => `${e.name}Seeds`).join(", ");
    imports.push(`import { ${seedNames} } from "./seeds";`);

    const fnNames = storeEntities.map((e) => `create${e.pascalName}Handlers`).join(", ");
    imports.push(`import { ${fnNames} } from "../generated/mock/handlers";`);
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

  // Reset calls
  const resetCalls: string[] = [];
  if (hasStores) {
    for (const entity of storeEntities) {
      resetCalls.push(`  ${entity.name}Store.reset();`);
    }
  }

  // Handler spreads
  const handlerSpreads: string[] = [];
  if (hasStores) {
    for (const entity of storeEntities) {
      handlerSpreads.push(`      ...create${entity.pascalName}Handlers(${entity.name}Store),`);
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
    "      // Add custom handler overrides here (placed before generated handlers)",
    "",
    "      // Generated handlers",
    ...handlerSpreads,
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
  storeName?: string,
): string {
  const method = operation.method.toLowerCase();
  const pattern = toMswPattern(operation.path);
  const isVoid = operation.method === "DELETE";

  if (!hasStore || !role) {
    const emptyBody = wrapFn ? `${wrapFn}({})` : "{}";
    return `    http.${method}("${pattern}", () => HttpResponse.json(${emptyBody})),`;
  }

  const store = storeName ?? `${entity.name}Store`;
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
    case "getAll":
      entry = `    http.${method}("${pattern}", () => HttpResponse.json(${store}.list())),`;
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
      const parentParam = extractParentPathParam(operation.path);
      const parentIsIdField = !parentParam || isPathParamIdField(parentParam, idField);
      entry = parentIsIdField
        ? generateReadHandler(method, pattern, store, parentParam, isNumericId)
        : generateReadByFieldHandler(method, pattern, store, parentParam!);
      break;
    }
    case "batchDelete":
      entry = `    http.${method}("${pattern}", () => HttpResponse.json({})),`;
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
      return `    http.${method}("${pattern}", () => HttpResponse.json(${emptyBody})),`;
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
    `    http.${method}("${pattern}", ({ request }) => {`,
    `      const url = new URL(request.url);`,
  ];

  if (filterParam) {
    const varName = sanitizeVarName(filterParam.name);
    const fieldName = sanitizeFieldName(filterParam.name);
    lines.push(
      `      const ${varName} = url.searchParams.get("${filterParam.name}");`,
      `      if (${varName}) return HttpResponse.json(${store}.filter((item) => item.${fieldName} === ${varName}));`,
    );
  }

  lines.push(
    `      const page = Number(url.searchParams.get("page") ?? "0");`,
    `      const size = Number(url.searchParams.get("size") ?? "10");`,
    `      const sort = url.searchParams.get("sort") ?? undefined;`,
    `      return HttpResponse.json(${store}.listPaged(page, size, sort));`,
    `    }),`,
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
    return `    http.${method}("${pattern}", () => HttpResponse.json(${store}.list()[0])),`;
  }

  const idExpr = isNumericId
    ? `Number(params.${pathParam})`
    : `String(params.${pathParam})`;

  return `    http.${method}("${pattern}", ({ params }) => HttpResponse.json(${store}.getById(${idExpr}) ?? ${store}.list()[0])),`;
}

function generateReadByFieldHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string,
): string {
  return `    http.${method}("${pattern}", ({ params }) => HttpResponse.json(${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0] ?? ${store}.list()[0])),`;
}

function generateSearchHandler(
  method: string,
  pattern: string,
  store: string,
): string {
  const lines = [
    `    http.${method}("${pattern}", ({ request }) => {`,
    `      const url = new URL(request.url);`,
    `      const page = Number(url.searchParams.get("page") ?? "0");`,
    `      const size = Number(url.searchParams.get("size") ?? "10");`,
    `      const sort = url.searchParams.get("sort") ?? undefined;`,
    `      return HttpResponse.json(${store}.listPaged(page, size, sort));`,
    `    }),`,
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
    `    http.${method}("${pattern}", async ({ request }) => {`,
    `      const items = await request.json() as { ${idField}: string | number; ${orderField}: number }[];`,
    `      for (const item of items) ${store}.update(item.${idField}, { ${orderField}: item.${orderField} } as never);`,
    `      return HttpResponse.json({});`,
    `    }),`,
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
  return `    http.${method}("${pattern}", () => HttpResponse.json(buildEmbeddedTree(${args.join(", ")}))),`;
}

function sanitizeVarName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_$]/g, "_");
}

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
    return `    http.${method}("${pattern}", async ({ request }) => { ${store}.create(await request.json() as ${pascalName}); return new HttpResponse(null, { status: 204 }); }),`;
  }
  return `    http.${method}("${pattern}", async ({ request }) => HttpResponse.json(${store}.create(await request.json() as ${pascalName}))),`;
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
      return `    http.${method}("${pattern}", async ({ request, params }) => { ${store}.update(${idExpr}, await request.json() as ${pascalName}); return new HttpResponse(null, { status: 204 }); }),`;
    }
    return `    http.${method}("${pattern}", async ({ request, params }) => HttpResponse.json(${store}.update(${idExpr}, await request.json() as ${pascalName}))),`;
  }

  // Body-based update (PUT /pet — no path param)
  if (isVoid) {
    const lines = [
      `    http.${method}("${pattern}", async ({ request }) => {`,
      `      const body = await request.json() as ${pascalName};`,
      `      ${store}.update(body.${idField}!, body) ?? ${store}.create(body);`,
      `      return new HttpResponse(null, { status: 204 });`,
      `    }),`,
    ];
    return lines.join("\n");
  }
  const lines = [
    `    http.${method}("${pattern}", async ({ request }) => {`,
    `      const body = await request.json() as ${pascalName};`,
    `      return HttpResponse.json(${store}.update(body.${idField}!, body) ?? ${store}.create(body));`,
    `    }),`,
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
      `    http.${method}("${pattern}", async ({ request, params }) => {`,
      `      const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
      `      if (item) ${store}.update(item.id as string | number, await request.json() as ${pascalName});`,
      `      return new HttpResponse(null, { status: 204 });`,
      `    }),`,
    ];
    return lines.join("\n");
  }
  const lines = [
    `    http.${method}("${pattern}", async ({ request, params }) => {`,
    `      const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
    `      if (!item) return HttpResponse.json(${store}.list()[0]);`,
    `      return HttpResponse.json(${store}.update(item.id as string | number, await request.json() as ${pascalName}));`,
    `    }),`,
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
    return `    http.${method}("${pattern}", () => HttpResponse.json(null)),`;
  }

  const idExpr = isNumericId
    ? `Number(params.${pathParam})`
    : `String(params.${pathParam})`;

  return `    http.${method}("${pattern}", ({ params }) => { ${store}.remove(${idExpr}); return HttpResponse.json(null); }),`;
}

function generateDeleteByFieldHandler(
  method: string,
  pattern: string,
  store: string,
  pathParam: string,
): string {
  const lines = [
    `    http.${method}("${pattern}", ({ params }) => {`,
    `      const item = ${store}.filter((item) => String(item.${pathParam}) === String(params.${pathParam}))[0];`,
    `      if (item) ${store}.remove(item.id as string | number);`,
    `      return HttpResponse.json(null);`,
    `    }),`,
  ];
  return lines.join("\n");
}

// ── Response Wrapper ─────────────────────────────────────────

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

    result += code.slice(start, i - 1) + ")";
    pos = i - 1;
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────

function toMswPattern(path: string): string {
  return `*${path}`;
}

function findIdField(entity: ExtractedEntity): string {
  const exact = entity.fields.find((f) => f.name.toLowerCase() === "id");
  if (exact) return exact.name;
  const idLike = entity.fields.find((f) => /[A-Z]?[Ii]d$/.test(f.name));
  if (idLike) return idLike.name;
  return "id";
}

function isIdFieldNumeric(entity: ExtractedEntity): boolean {
  const idFieldName = findIdField(entity);
  const field = entity.fields.find((f) => f.name === idFieldName);
  return field ? field.type === "integer" || field.type === "number" : true;
}

function isPathParamIdField(pathParam: string, idField: string): boolean {
  if (pathParam === idField) return true;
  return pathParam.toLowerCase().endsWith("id");
}

function extractPathParam(path: string): string | undefined {
  const match = path.match(/:(\w+)$/);
  return match ? match[1] : undefined;
}

function extractParentPathParam(path: string): string | undefined {
  const match = path.match(/:(\w+)\/[^/]+$/);
  return match ? match[1] : undefined;
}

function findOrderField(operation: ExtractedOperation, entity: ExtractedEntity): string {
  const props = operation.bodySchema?.items?.properties;
  if (props) {
    const nonIdField = Object.keys(props).find((k) => k.toLowerCase() !== "id" && !k.toLowerCase().endsWith("id"));
    if (nonIdField) return nonIdField;
  }

  const orderNames = ["displayOrder", "sortOrder", "orderIndex"];
  for (const name of orderNames) {
    if (entity.fields.some((f) => f.name === name)) return name;
  }

  return "displayOrder";
}

function findParentIdField(entity: ExtractedEntity): string {
  if (entity.fields.some((f) => f.name === "parentId")) return "parentId";
  const parentLike = entity.fields.find((f) => /parent.*id/i.test(f.name));
  if (parentLike) return parentLike.name;
  return "parentId";
}

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
