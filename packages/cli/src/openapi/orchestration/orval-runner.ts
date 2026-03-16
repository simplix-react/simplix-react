import { join } from "node:path";
import { readdir, readFile, stat, writeFile, unlink } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { writeFileWithDir, pathExists } from "../../utils/fs.js";
import type { OpenApiNamingStrategy, OperationContext } from "../naming/naming-strategy.js";
import type ora from "ora";

// ── Orval Module Interface ───────────────────────────────────

interface OrvalModule {
  generate: (
    config?: string | Record<string, unknown>,
    workspace?: string,
  ) => Promise<void>;
}

// ── Orval Import & Run ───────────────────────────────────────

export async function tryImportOrval(
  projectRoot: string,
): Promise<OrvalModule | null> {
  try {
    const { createRequire } = await import("node:module");
    const req = createRequire(join(projectRoot, "package.json"));
    const resolved = req.resolve("orval");
    const mod = await import(pathToFileURL(resolved).href);
    // v8 ESM: generate is a named export; v7 CJS: generate is on mod.default
    const generate = mod.generate ?? mod.default?.generate;
    if (typeof generate !== "function") return null;
    return { generate } as OrvalModule;
  } catch {
    return null;
  }
}

export interface RunOrvalOptions {
  naming?: OpenApiNamingStrategy;
  /** Tag → entity name map for multi-entity domains */
  entityMap?: Map<string, string>;
  /** Fallback entity name when tag is not in entityMap (camelCase) */
  entityName?: string;
  /** Spec path relative to targetDir (needed for programmatic config when naming is set) */
  specRelativePath?: string;
  /** Tag list for Orval input filter (needed for programmatic config when naming is set) */
  tags?: string[];
}

export async function runOrval(
  spinner: ReturnType<typeof ora>,
  targetDir: string,
  dirName: string,
  options?: RunOrvalOptions,
): Promise<void> {
  spinner.text = "Running Orval code generation...";

  const orval = await tryImportOrval(targetDir);
  if (!orval) {
    spinner.warn("Orval not found — skipping code generation.");
    console.log("  Install orval and run manually:");
    console.log("  pnpm install");
    console.log(`  cd packages/${dirName} && npx orval`);
    return;
  }

  try {
    if (options?.specRelativePath && options.tags) {
      // Build Orval config programmatically.
      // Avoids `await import()` on .ts files which fails in Node.js ESM.
      const naming = options.naming;
      const entityMap = options.entityMap;
      const fallbackEntityName = options.entityName ?? "entity";
      const specTarget = options.specRelativePath;
      const tagsFilter = options.tags;
      const mode = "tags-split";

      // operationName override is only needed when a naming strategy is provided
      const operationNameOverride = naming
        ? (operation: Record<string, unknown>, route: string, verb: string) => {
            const tags = (operation.tags ?? []) as string[];
            const entityName = (tags[0] && entityMap?.get(tags[0])) ?? fallbackEntityName;
            const opContext = buildOperationContext(operation, route, verb, entityName);
            const resolved = naming.resolveOperation(opContext);
            return resolved.hookName;
          }
        : undefined;

      // Main config (react-query hooks with optional operationName override)
      const mainConfig = {
        input: {
          target: specTarget,
          filters: { tags: tagsFilter },
        },
        output: {
          mode,
          target: "src/generated/endpoints",
          schemas: "src/generated/model",
          client: "react-query",
          httpClient: "fetch",
          clean: true,
          prettier: true,
          override: {
            mutator: {
              path: "src/mutator.ts",
              name: "customFetch",
            },
            ...(operationNameOverride && { operationName: operationNameOverride }),
          },
        },
      };

      await orval.generate(mainConfig as Record<string, unknown>, targetDir);

      // Zod config (no operationName override needed)
      const zodConfig = {
        input: {
          target: specTarget,
          filters: { tags: tagsFilter },
        },
        output: {
          mode,
          target: "src/generated/endpoints",
          client: "zod",
          fileExtension: ".zod.ts",
        },
      };

      await orval.generate(zodConfig as Record<string, unknown>, targetDir);
    } else {
      // No spec info at all — cannot generate
      spinner.warn("Missing spec info — skipping Orval code generation.");
    }
  } catch (err) {
    spinner.warn("Orval code generation failed.");
    console.log(String(err));
    console.log("  Run manually:");
    console.log(`  cd packages/${dirName} && npx orval`);
  }
}

/**
 * Build OperationContext from Orval's operationName callback arguments.
 */
function buildOperationContext(
  operation: Record<string, unknown>,
  route: string,
  verb: string,
  entityName: string,
): OperationContext {
  // Orval passes routes in template literal format: ${param} instead of {param}
  const normalizedRoute = route.replace(/\$\{([^}]+)\}/g, "{$1}");

  const pathParams: string[] = [];
  const paramMatches = normalizedRoute.matchAll(/\{([^}]+)\}/g);
  for (const match of paramMatches) {
    pathParams.push(match[1]);
  }

  const parameters = (operation.parameters ?? []) as Array<Record<string, unknown>>;
  const queryParams = parameters
    .filter((p) => p.in === "query")
    .map((p) => p.name as string);

  const tags = (operation.tags ?? []) as string[];

  // Extract response type from responses
  let responseType: string | undefined;
  const responses = operation.responses as Record<string, Record<string, unknown>> | undefined;
  if (responses) {
    for (const code of Object.keys(responses)) {
      if (!code.startsWith("2")) continue;
      const content = responses[code]?.content as Record<string, Record<string, unknown>> | undefined;
      const schema = content?.["application/json"]?.schema as Record<string, unknown> | undefined;
      if (schema?.$ref) {
        const ref = schema.$ref as string;
        responseType = ref.split("/").pop();
      }
      break;
    }
  }

  // Extract request type from requestBody
  let requestType: string | undefined;
  const requestBody = operation.requestBody as Record<string, unknown> | undefined;
  if (requestBody) {
    const content = requestBody.content as Record<string, Record<string, unknown>> | undefined;
    const schema = content?.["application/json"]?.schema as Record<string, unknown> | undefined;
    if (schema?.$ref) {
      const ref = schema.$ref as string;
      requestType = ref.split("/").pop();
    }
  }

  // Collect x-* extensions
  const extensions: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(operation)) {
    if (key.startsWith("x-")) {
      extensions[key] = value;
    }
  }

  return {
    operationId: (operation.operationId as string) ?? "",
    method: verb.toUpperCase(),
    path: normalizedRoute,
    tag: tags[0],
    entityName,
    summary: operation.summary as string | undefined,
    description: operation.description as string | undefined,
    responseType,
    requestType,
    pathParams,
    queryParams,
    extensions,
  };
}

// ── Endpoint File Utilities ──────────────────────────────────

/**
 * Collect generated .ts files under endpoints/, supporting both flat (split mode)
 * and nested (tags-split mode) directory structures.
 * Returns relative paths from endpointsDir (e.g. "foo.ts" or "pet/pet.ts").
 */
export async function collectEndpointFiles(
  endpointsDir: string,
): Promise<string[]> {
  const entries = await readdir(endpointsDir);
  const result: string[] = [];

  for (const entry of entries) {
    const entryPath = join(endpointsDir, entry);
    const s = await stat(entryPath);
    if (s.isFile() && entry.endsWith(".ts")) {
      result.push(entry);
    } else if (s.isDirectory()) {
      const subFiles = await readdir(entryPath);
      for (const sub of subFiles) {
        if (sub.endsWith(".ts")) {
          result.push(`${entry}/${sub}`);
        }
      }
    }
  }
  return result;
}

/**
 * Strip error response types from Orval-generated response union types.
 * Orval generates: `type fooResponse = fooResponseSuccess | fooResponseError;`
 * react-query separates errors into `error`, so `data` is always the success type at runtime.
 * This narrows the type to match: `type fooResponse = fooResponseSuccess;`
 */
export async function narrowResponseTypes(targetDir: string): Promise<void> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return;

  const allFiles = await collectEndpointFiles(endpointsDir);
  const tsFiles = allFiles.filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".msw.ts") && !f.endsWith(".zod.ts") && f !== "index.ts" && !f.startsWith("_"),
  );

  for (const file of tsFiles) {
    const filePath = join(endpointsDir, file);
    let content = await readFile(filePath, "utf-8");

    // Multi-line: `type fooResponse =\n  | fooResponseSuccess\n  | fooResponseError;`
    content = content.replace(
      /export type (\w+) =\n\s*\| (\w+Success)\n\s*\| \w+Error;/g,
      "export type $1 = $2;",
    );

    // Single-line: `type fooResponse = fooResponseSuccess | fooResponseError;`
    content = content.replace(
      /export type (\w+) = (\w+Success) \| \w+Error;/g,
      "export type $1 = $2;",
    );

    await writeFile(filePath, content);
  }
}

export async function addTsNocheckToEndpoints(targetDir: string): Promise<void> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return;

  const allFiles = await collectEndpointFiles(endpointsDir);
  const tsFiles = allFiles.filter((f) => f.endsWith(".ts"));

  for (const file of tsFiles) {
    const filePath = join(endpointsDir, file);
    const content = await readFile(filePath, "utf-8");
    if (!content.startsWith("// @ts-nocheck")) {
      await writeFile(filePath, `// @ts-nocheck\n${content}`);
    }
  }
}

export async function generateEndpointsBarrel(targetDir: string): Promise<void> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return;

  const allFiles = await collectEndpointFiles(endpointsDir);
  const mainFiles = allFiles.filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".msw.ts") && !f.endsWith(".zod.ts") && f !== "index.ts" && !f.startsWith("_"),
  );

  if (mainFiles.length === 0) return;

  const reExports = mainFiles.map((f) => {
    const modulePath = `./${f.replace(".ts", "")}`;
    return `export * from "${modulePath}";`;
  });

  const hasSharedTypes = allFiles.some((f) => f === "_shared-types.ts");
  const isMultiFileMode = mainFiles.length > 1;
  const prefix = (isMultiFileMode && !hasSharedTypes) ? "// @ts-nocheck\n" : "";

  const content = prefix + reExports.join("\n") + "\n";
  await writeFileWithDir(join(endpointsDir, "index.ts"), content);
}

export async function extractSharedEndpointTypes(targetDir: string): Promise<boolean> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return false;

  const allFiles = await collectEndpointFiles(endpointsDir);
  const mainFiles = allFiles.filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".msw.ts") && !f.endsWith(".zod.ts") && f !== "index.ts" && !f.startsWith("_"),
  );
  if (mainFiles.length <= 1) return false;

  // Extract HTTPStatusCode block from first file
  const firstContent = await readFile(join(endpointsDir, mainFiles[0]), "utf-8");
  const blockRegex = /(export type HTTPStatusCode[\s\S]*?export type HTTPStatusCodes\b[\s\S]*?;\n)/;
  const match = firstContent.match(blockRegex);
  if (!match) return false;

  const sharedBlock = match[1];
  const typeNames = [...sharedBlock.matchAll(/export type (\w+)/g)].map((m) => m[1]);

  // Create shared types file
  await writeFile(
    join(endpointsDir, "_shared-types.ts"),
    `// Auto-generated shared HTTP status code types\n${sharedBlock}`,
  );

  // Remove block from each file and add import
  for (const file of mainFiles) {
    const filePath = join(endpointsDir, file);
    const content = await readFile(filePath, "utf-8");
    const depth = file.split("/").length - 1;
    const importPath = depth > 0 ? "../".repeat(depth) + "_shared-types" : "./_shared-types";
    const importLine = `import type { ${typeNames.join(", ")} } from "${importPath}";\n`;
    const cleaned = content.replace(blockRegex, importLine);
    if (cleaned !== content) {
      await writeFile(filePath, cleaned);
    }
  }

  return true;
}

// ── Prune Unused Models ─────────────────────────────────────

/**
 * Remove model files not transitively referenced by endpoint files.
 * Orval generates all schemas from the spec even when endpoint filtering is
 * applied. This step scans the endpoint imports, traces transitive model
 * dependencies, and deletes everything else.
 */
export async function pruneUnusedModels(targetDir: string): Promise<number> {
  const modelDir = join(targetDir, "src/generated/model");
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(modelDir)) || !(await pathExists(endpointsDir)))
    return 0;

  // 1. Collect all type names imported by endpoint files from "../model"
  const epFiles = await collectEndpointFiles(endpointsDir);
  const rootTypes = new Set<string>();
  for (const file of epFiles) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const content = await readFile(join(endpointsDir, file), "utf-8");
    // Match both `import type { A, B }` and multi-line imports from "../model" or "../../model"
    for (const m of content.matchAll(
      /import type \{([^}]+)\} from ["'](?:\.\.\/)+model["']/gs,
    )) {
      for (const name of m[1].split(",")) {
        const trimmed = name.trim();
        if (trimmed) rootTypes.add(trimmed);
      }
    }
  }
  if (rootTypes.size === 0) return 0;

  // 2. Build type → file and file → deps maps by scanning model files
  const allModelFiles = (await readdir(modelDir)).filter(
    (f) => f.endsWith(".ts") && f !== "index.ts",
  );
  const typeToFile = new Map<string, string>();
  const fileDeps = new Map<string, Set<string>>();

  for (const file of allModelFiles) {
    const fileName = file.replace(".ts", "");
    const content = await readFile(join(modelDir, file), "utf-8");

    for (const m of content.matchAll(
      /export (?:interface|type|enum|const|function) (\w+)/g,
    )) {
      typeToFile.set(m[1], fileName);
    }

    const deps = new Set<string>();
    for (const m of content.matchAll(
      /import type \{ \w+ \} from ["']\.\/(\w+)["']/g,
    )) {
      deps.add(m[1]);
    }
    fileDeps.set(fileName, deps);
  }

  // 3. BFS from root types to collect all transitively needed files
  const neededFiles = new Set<string>();
  const queue: string[] = [];
  for (const typeName of rootTypes) {
    const file = typeToFile.get(typeName);
    if (file && !neededFiles.has(file)) {
      neededFiles.add(file);
      queue.push(file);
    }
  }
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const dep of fileDeps.get(current) ?? []) {
      if (!neededFiles.has(dep)) {
        neededFiles.add(dep);
        queue.push(dep);
      }
    }
  }

  // 4. Delete unused files
  const toDelete = allModelFiles.filter(
    (f) => !neededFiles.has(f.replace(".ts", "")),
  );
  for (const f of toDelete) {
    await unlink(join(modelDir, f));
  }

  // 5. Rewrite index.ts keeping only needed exports
  const indexPath = join(modelDir, "index.ts");
  const indexContent = await readFile(indexPath, "utf-8");
  const newLines = indexContent.split("\n").filter((line) => {
    const m = line.match(/from ["']\.\/(\w+)["']/);
    if (!m) return true;
    return neededFiles.has(m[1]);
  });
  await writeFile(indexPath, newLines.join("\n"));

  return toDelete.length;
}

// ── Deduplicate Generated Files ──────────────────────────────

/**
 * Remove duplicate export declarations from Orval-generated files.
 *
 * In tags-split mode, when a tag has multiple endpoints sharing the same HTTP
 * method (e.g. three PUT endpoints), Orval appends duplicate type/function
 * declarations to the same file. This step scans model and endpoint files,
 * keeping only the first occurrence of each exported symbol.
 */
export async function deduplicateGeneratedFiles(targetDir: string): Promise<number> {
  let totalRemoved = 0;

  const modelDir = join(targetDir, "src/generated/model");
  const endpointsDir = join(targetDir, "src/generated/endpoints");

  // Process model files
  if (await pathExists(modelDir)) {
    const modelFiles = (await readdir(modelDir)).filter(
      (f) => f.endsWith(".ts") && f !== "index.ts",
    );
    for (const file of modelFiles) {
      const removed = await deduplicateFile(join(modelDir, file));
      totalRemoved += removed;
    }
  }

  // Process endpoint files
  if (await pathExists(endpointsDir)) {
    const epFiles = await collectEndpointFiles(endpointsDir);
    for (const file of epFiles) {
      if (!file.endsWith(".ts") || file === "index.ts") continue;
      const removed = await deduplicateFile(join(endpointsDir, file));
      totalRemoved += removed;
    }
  }

  return totalRemoved;
}

/**
 * Remove duplicate export blocks from a single file.
 *
 * Tracks seen symbols as `kind:name` pairs (e.g. `type:Foo`, `const:Foo`)
 * because TypeScript allows a `type` and a `const` with the same name to
 * coexist (companion object pattern).
 */
async function deduplicateFile(filePath: string): Promise<number> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  // Track seen symbols as "kind:name" to allow type+const coexistence
  const seenExports = new Set<string>();
  const resultLines: string[] = [];
  let duplicatesRemoved = 0;
  let skipUntilNextExport = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect export declarations with their kind
    const exportMatch = line.match(
      /^export (type|interface|const|function|enum) (\w+)/,
    );

    if (exportMatch) {
      const kind = exportMatch[1];
      const symbolName = exportMatch[2];
      const key = `${kind}:${symbolName}`;

      if (seenExports.has(key)) {
        // Duplicate — skip this block
        duplicatesRemoved++;
        skipUntilNextExport = true;

        // Also remove preceding blank lines and JSDoc/import lines that belong to this block
        while (
          resultLines.length > 0 &&
          (resultLines[resultLines.length - 1].trim() === "" ||
            resultLines[resultLines.length - 1].trim().startsWith("*") ||
            resultLines[resultLines.length - 1].trim().startsWith("/**") ||
            resultLines[resultLines.length - 1].trim().startsWith("import type"))
        ) {
          resultLines.pop();
        }
        continue;
      }
      seenExports.add(key);
      skipUntilNextExport = false;
    }

    if (skipUntilNextExport) {
      // Skip lines until we hit the next export or end of file
      // A blank line followed by an export/import signals the end of the duplicate block
      if (line.trim() === "" && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (
          nextLine.startsWith("export ") ||
          nextLine.startsWith("import ") ||
          nextLine.startsWith("/**")
        ) {
          skipUntilNextExport = false;
          resultLines.push(line);
        }
      }
      continue;
    }

    resultLines.push(line);
  }

  if (duplicatesRemoved > 0) {
    await writeFile(filePath, resultLines.join("\n"));
  }

  return duplicatesRemoved;
}

// ── Schemas Proxy ────────────────────────────────────────────

/**
 * Generate or update the schemas proxy file.
 *
 * When the file already exists, only the auto-generated re-export lines are
 * updated (added/removed to match current endpoints). Any custom overrides
 * below the marker comment are preserved.
 */
export async function generateSchemasProxy(targetDir: string): Promise<void> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return;

  const allFiles = await collectEndpointFiles(endpointsDir);
  const zodFiles = allFiles.filter((f) => f.endsWith(".zod.ts"));

  if (zodFiles.length === 0) return;

  const CUSTOM_MARKER = "// Custom schema overrides and additions:";

  const reExports = zodFiles.map((f) => {
    const modulePath = `./generated/endpoints/${f.replace(".ts", "")}`;
    return `export * from "${modulePath}";`;
  });

  const schemasPath = join(targetDir, "src/schemas.ts");
  const existingContent = (await pathExists(schemasPath))
    ? await readFile(schemasPath, "utf-8")
    : "";

  // Extract custom section from existing file (everything after the marker)
  let customSection = "";
  if (existingContent) {
    const markerIdx = existingContent.indexOf(CUSTOM_MARKER);
    if (markerIdx !== -1) {
      customSection = existingContent.slice(markerIdx);
    }
  }

  if (!customSection) {
    customSection = [
      CUSTOM_MARKER,
      '// import { z } from "zod";',
      '// export const updatePetBody = z.object({ ... });',
      "",
    ].join("\n");
  }

  const content = [
    "// Re-export all Orval-generated Zod schemas.",
    "// To override a specific schema, define it below with the same export name.",
    "// Local exports take precedence over wildcard re-exports.",
    ...reExports,
    "",
    customSection,
  ].join("\n");

  await writeFileWithDir(schemasPath, content);
}

// ── Domain Mutator Content ───────────────────────────────────

/**
 * Extract the mutator strategy from an existing mutator.ts file content.
 * Returns the strategy string (e.g. "boot") or undefined for the default strategy.
 */
export function extractMutatorStrategy(content: string): string | undefined {
  const match = content.match(/getMutator\((?:"([^"]*)")?\)/);
  if (!match) return undefined;
  return match[1] || undefined;
}

export function generateDomainMutatorContent(domainName: string, strategy?: string): string {
  const strategyArg = !strategy || strategy === "default" ? "" : `"${strategy}"`;
  return [
    'import { getMutator } from "@simplix-react/api";',
    "",
    "export async function customFetch<T>(url: string, options: RequestInit): Promise<T> {",
    `  return getMutator(${strategyArg})<T>(url, options);`,
    "}",
    "",
    "export type ErrorType<T = unknown> = Error & { data?: T };",
    "export type BodyType<T> = T;",
    "",
  ].join("\n");
}

// ── Hook Import Map ──────────────────────────────────────────

/**
 * Scan endpoint files and build a map of hook name → specific import path.
 * This avoids barrel re-export issues (duplicate HTTPStatusCode types in tags-split mode).
 */
export async function buildHookImportMap(
  targetDir: string,
): Promise<Map<string, string>> {
  const endpointsDir = join(targetDir, "src/generated/endpoints");
  if (!(await pathExists(endpointsDir))) return new Map();

  const files = await collectEndpointFiles(endpointsDir);
  const mainFiles = files.filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".msw.ts") && !f.endsWith(".zod.ts") && f !== "index.ts",
  );

  const map = new Map<string, string>();
  for (const file of mainFiles) {
    const content = await readFile(join(endpointsDir, file), "utf-8");
    for (const m of content.matchAll(/export (?:const|function) (use\w+)/g)) {
      map.set(m[1], `../generated/endpoints/${file.replace(".ts", "")}`);
    }
  }
  return map;
}
