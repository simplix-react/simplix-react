import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import ts from "typescript";

/*
 * Import cycles among the source files under a set of roots.
 *
 * A cycle matters because Vite's hot update walks the importers of the edited module, and a walk
 * that meets a module it already visited gives up and reloads the whole page. So the edges are the
 * ones the bundler keeps: the transform, not the type checker, decides which imports exist at run
 * time.
 * - `import type`, `export type` and `export { type X } from` leave no edge.
 * - `import { type X } from` leaves an edge when the project sets `verbatimModuleSyntax` (the
 *   transform keeps it as a bare `import "..."`) and no edge when it does not.
 * - `import("...")` is an edge: the importer is recorded in the module graph all the same.
 * Bare specifiers resolve with the `source` condition, the one the dev server resolves with, so a
 * cycle that crosses workspace packages is found at the files, not at the package boundary. Only
 * files under the roots are nodes; a specifier that resolves outside them ends the walk.
 */

/** One run-time module specifier and the kind of edge it makes. */
export interface Specifier {
  readonly specifier: string;
  readonly kind: "static" | "dynamic";
}

/** One edge of the import graph. */
export interface Edge {
  readonly to: string;
  readonly kind: "static" | "dynamic";
}

export type Edges = Map<string, Edge[]>;

/** A relative specifier that resolves to nothing, so its edge is not checked. */
export interface Unresolved {
  readonly file: string;
  readonly specifier: string;
}

export interface ImportGraph {
  readonly files: string[];
  readonly edges: Edges;
  readonly unresolved: Unresolved[];
}

export interface CycleReport extends ImportGraph {
  readonly components: string[][];
  readonly cycles: string[][];
}

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", ".turbo", ".git"]);
const ASSET_EXTENSIONS = new Set([".css", ".scss", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2", ".json", ".md", ".txt", ".html", ".wasm"]);
const MAX_CYCLES_PER_COMPONENT = 100;

function listSources(directory: string, found: string[]): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      listSources(path, found);
    } else if (SOURCE_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf("."))) && !entry.name.endsWith(".d.ts")) {
      found.push(path);
    }
  }
  return found;
}

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.(?:m|c)?js$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** The run-time module specifiers of one file, each with the kind of edge it makes. */
export function readSpecifiers(file: string, text: string, verbatimModuleSyntax: boolean): Specifier[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
  const found: Specifier[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const elements: readonly ts.ImportSpecifier[] = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : [];
      const allInlineTypes = !!clause && !clause.name && elements.length > 0 && elements.every((element) => element.isTypeOnly);
      const typeOnly = !!clause && (clause.isTypeOnly || (allInlineTypes && !verbatimModuleSyntax));
      if (!typeOnly) found.push({ specifier: node.moduleSpecifier.text, kind: "static" });
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const elements: readonly ts.ExportSpecifier[] = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : [];
      const allInlineTypes = elements.length > 0 && elements.every((element) => element.isTypeOnly);
      if (!node.isTypeOnly && !allInlineTypes) found.push({ specifier: node.moduleSpecifier.text, kind: "static" });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) {
      found.push({ specifier: (node.arguments[0] as ts.StringLiteralLike).text, kind: "dynamic" });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function readVerbatimModuleSyntax(workspace: string): boolean {
  const configPath = join(workspace, "tsconfig.json");
  if (!existsSync(configPath)) return false;
  const read = ts.readConfigFile(configPath, ts.sys.readFile);
  if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, "\n"));
  return ts.parseJsonConfigFileContent(read.config, ts.sys, workspace).options.verbatimModuleSyntax === true;
}

/** The candidates a relative specifier names, in the order a bundler tries them. */
export function relativeCandidates(file: string, specifier: string): string[] {
  const at = join(dirname(file), specifier.replace(/[?#].*$/, ""));
  return [at, ...[".tsx", ".ts", ".jsx", ".js", ".mts", ".mjs"].map((ext) => `${at}${ext}`), ...["index.tsx", "index.ts", "index.js"].map((name) => join(at, name))];
}

/**
 * The relative imports of the given files that name no file on disk: a generated page importing a
 * sibling its regeneration never laid down fails the whole app at its first load.
 *
 * @param files absolute paths of the files to read
 * @returns each import that resolves to nothing, asset imports left out
 */
export function unresolvedRelativeImports(files: readonly string[]): Unresolved[] {
  const unresolved: Unresolved[] = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    for (const { specifier } of readSpecifiers(file, readFileSync(file, "utf8"), true)) {
      if (!/^\.\.?\//.test(specifier)) continue;
      const clean = specifier.replace(/[?#].*$/, "");
      if (ASSET_EXTENSIONS.has(clean.slice(clean.lastIndexOf(".")))) continue;
      if (!relativeCandidates(file, clean).some((one) => existsSync(one) && statSync(one).isFile())) unresolved.push({ file, specifier });
    }
  }
  return unresolved;
}

/** Builds the import graph of the files under `roots`: file -> [{ to, kind }], plus what could not be resolved. */
export function buildGraph(workspaceDirectory: string, roots: readonly string[]): ImportGraph {
  // The resolver reports real paths, so the files are listed from the real directory too.
  const workspace = realpathSync(workspaceDirectory);
  const verbatimModuleSyntax = readVerbatimModuleSyntax(workspace);
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    customConditions: ["source"],
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
  };
  const cache = ts.createModuleResolutionCache(workspace, (name) => name, options);
  const files = roots.flatMap((root) => (existsSync(join(workspace, root)) ? listSources(join(workspace, root), []) : []));
  const inScope = new Set(files);
  const edges: Edges = new Map();
  const unresolved: Unresolved[] = [];
  for (const file of files) {
    const out: Edge[] = [];
    for (const { specifier, kind } of readSpecifiers(file, readFileSync(file, "utf8"), verbatimModuleSyntax)) {
      const clean = specifier.replace(/[?#].*$/, "");
      const resolved = ts.resolveModuleName(clean, file, options, ts.sys, cache).resolvedModule;
      const target = resolved?.resolvedFileName;
      if (!target && /^\.\.?\//.test(clean)) {
        const extension = clean.slice(clean.lastIndexOf("."));
        if (!ASSET_EXTENSIONS.has(extension)) unresolved.push({ file, specifier });
        continue;
      }
      if (target && inScope.has(target)) out.push({ to: target, kind });
    }
    edges.set(file, out);
  }
  return { files, edges, unresolved };
}

/** Strongly connected components with more than one file, or one file that imports itself. */
export function cyclicComponents(files: readonly string[], edges: Edges): string[][] {
  let counter = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  const visit = (start: string): void => {
    // Iterative form of Tarjan's walk, so a long import chain cannot overflow the call stack.
    const work: { node: string; next: number }[] = [{ node: start, next: 0 }];
    index.set(start, counter);
    low.set(start, counter);
    counter += 1;
    stack.push(start);
    onStack.add(start);
    while (work.length > 0) {
      const frame = work[work.length - 1]!;
      const out = edges.get(frame.node) ?? [];
      if (frame.next < out.length) {
        const { to } = out[frame.next]!;
        frame.next += 1;
        if (!index.has(to)) {
          index.set(to, counter);
          low.set(to, counter);
          counter += 1;
          stack.push(to);
          onStack.add(to);
          work.push({ node: to, next: 0 });
        } else if (onStack.has(to)) {
          low.set(frame.node, Math.min(low.get(frame.node)!, index.get(to)!));
        }
        continue;
      }
      work.pop();
      if (work.length > 0) {
        const parent = work[work.length - 1]!.node;
        low.set(parent, Math.min(low.get(parent)!, low.get(frame.node)!));
      }
      if (low.get(frame.node) === index.get(frame.node)) {
        const members: string[] = [];
        let member: string;
        do {
          member = stack.pop()!;
          onStack.delete(member);
          members.push(member);
        } while (member !== frame.node);
        const selfImport = members.length === 1 && (edges.get(members[0]!) ?? []).some((edge) => edge.to === members[0]);
        if (members.length > 1 || selfImport) components.push(members.sort());
      }
    }
  };
  for (const file of files) if (!index.has(file)) visit(file);
  return components.sort((a, b) => a[0]!.localeCompare(b[0]!));
}

/** The elementary cycles inside one component, each starting at its first file in sorted order. */
export function cyclesOf(component: readonly string[], edges: Edges): string[][] {
  const members = new Set(component);
  const found: string[][] = [];
  const walk = (root: string, node: string, path: string[], onPath: Set<string>): void => {
    if (found.length >= MAX_CYCLES_PER_COMPONENT) return;
    for (const { to } of edges.get(node) ?? []) {
      if (!members.has(to) || to < root) continue;
      if (to === root) {
        found.push([...path]);
      } else if (!onPath.has(to)) {
        onPath.add(to);
        path.push(to);
        walk(root, to, path, onPath);
        path.pop();
        onPath.delete(to);
      }
    }
  };
  for (const root of component) walk(root, root, [root], new Set([root]));
  return found;
}

export function edgeKind(edges: Edges, from: string, to: string): string {
  const kinds = new Set((edges.get(from) ?? []).filter((edge) => edge.to === to).map((edge) => edge.kind));
  return kinds.has("static") ? "" : " (dynamic)";
}

export function checkCycles(workspace: string, roots: readonly string[]): CycleReport {
  const { files, edges, unresolved } = buildGraph(workspace, roots);
  const components = cyclicComponents(files, edges);
  const cycles = components.flatMap((component) => cyclesOf(component, edges));
  return { files, edges, unresolved, components, cycles };
}
