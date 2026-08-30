// Reading one generated output tree into the set of names it exports.
//
// A tree exists only as TypeScript on disk, so it is read with the compiler's parser. Nothing here
// type-checks: `createSourceFile` parses one file with no module resolution, which is what is
// wanted — the outputs import workspace packages a standalone program could not resolve, and a
// program built over them would report those as errors of its own.

import { readdir, readFile } from "node:fs/promises";
import { join, relative, basename } from "node:path";
import ts from "typescript";

/**
 * A name category both pipelines are contracted to produce.
 *
 * Orval emits a great deal besides — a type per HTTP status, a query-options builder, a result
 * and an error alias per operation — that the meta pipeline has no counterpart for and never
 * will. Those are excluded by {@link isPlumbing} rather than reported, and the count of what was
 * excluded is printed so the filter stays visible.
 */
export type Category =
  | "type"
  | "params"
  | "constMap"
  | "request"
  | "url"
  | "queryKey"
  | "hook"
  | "handlers"
  | "zod"
  /**
   * A declaration only one pipeline has any notion of, and that nothing outside the generated
   * tree imports: the meta path's access and filter metadata, and each side's own names for a
   * request's response and a mutation's variables. Reported, never counted as drift.
   */
  | "internal";

/** One member of a declared object shape. */
export interface MemberInfo {
  name: string;
  /** The member's type as written, with whitespace collapsed and unions ordered. */
  type: string;
  optional: boolean;
}

/** One exported declaration, merged across the several statements that may declare a name. */
export interface Decl {
  name: string;
  category: Category;
  /** Path relative to the tree root, for a report that says where to look. */
  file: string;
  /** Present for an interface or an object-shaped alias. */
  members?: Map<string, MemberInfo>;
  /** For a query key: one entry per element of the returned array, `"value"` or `"spread"`. */
  queryKeyShape?: string[];
  /** Names this interface extends, before {@link resolveInheritance} folds their members in. */
  heritage?: string[];
  /** `Record<K, V>` when the declaration is nothing but an index signature. */
  indexSignature?: string;
}

/** Everything one output tree exports, by name. */
export interface Surface {
  declarations: Map<string, Decl>;
  /** How many files were read. */
  files: number;
  /** How many exported declarations were excluded as pipeline plumbing. */
  excluded: number;
}


// ── Collection ────────────────────────────────────────────────────────────────

/** Read one output tree and describe everything it exports. */
export async function collectSurface(root: string): Promise<Surface> {
  const surface: Surface = { declarations: new Map(), files: 0, excluded: 0 };
  for (const path of await sourceFiles(root)) {
    const text = await readFile(path, "utf-8");
    surface.files++;
    collectFile(surface, relative(root, path), text);
  }
  resolveInheritance(surface);
  normaliseIndexSignatureAliases(surface);
  return surface;
}

/**
 * Replace a name that stands for nothing but an index signature with the shape it stands for.
 *
 * Orval gives `Map<String, String>` a declaration of its own — `interface StringMap { [key:
 * string]: string }` — while the SimpliX Meta path writes `Record<string, string>` inline. The two are the
 * same type under two spellings, and comparing the spellings reports one difference per i18n field
 * plus the alias itself. Rewriting each occurrence to the structural form lets the comparison see
 * what a caller sees.
 *
 * Only an interface whose sole member is an index signature qualifies; anything with a named
 * member is a shape in its own right and is compared as one.
 */
function normaliseIndexSignatureAliases(surface: Surface): void {
  const structural = new Map<string, string>();
  for (const [name, decl] of surface.declarations) {
    if (decl.indexSignature === undefined || (decl.members?.size ?? 0) > 0) continue;
    structural.set(name, decl.indexSignature);
    surface.declarations.delete(name);
  }
  if (structural.size === 0) return;

  const rewrite = (type: string): string => {
    let out = type;
    for (const [name, shape] of structural) {
      out = out.replace(new RegExp(`\\b${name}\\b`, "g"), shape);
    }
    return out;
  };

  for (const decl of surface.declarations.values()) {
    if (!decl.members) continue;
    for (const [field, info] of decl.members) {
      const rewritten = rewrite(info.type);
      if (rewritten !== info.type) decl.members.set(field, { ...info, type: rewritten });
    }
  }
}

/**
 * Fold each declaration's inherited members into its own, so the two trees are compared as the
 * shapes a caller sees rather than as the text each generator wrote.
 *
 * Orval flattens a Java hierarchy — `OrganizationRestUpdateBody` lists all 21 members — while the
 * SimpliX Meta path preserves it, emitting `interface OrganizationUpdateDTO extends OrganizationCreateDTO`
 * with the one member the child adds. Comparing own members against flattened ones reports every
 * inherited field as missing: 40 errors on one entity, all of them the feature this project
 * exists to add.
 *
 * A parent outside the surface leaves the child as it stands; the missing name is already
 * reported on its own.
 */
function resolveInheritance(surface: Surface): void {
  const resolved = new Set<string>();

  const resolve = (name: string, seen: Set<string>): void => {
    if (resolved.has(name) || seen.has(name)) return;
    seen.add(name);
    const decl = surface.declarations.get(name);
    if (!decl) return;

    for (const parentName of decl.heritage ?? []) {
      resolve(parentName, seen);
      const parent = surface.declarations.get(parentName);
      if (!parent?.members) continue;
      if (!decl.members) decl.members = new Map();
      // Parent first, so a child that re-declares a member keeps its own reading of it.
      const merged = new Map(parent.members);
      for (const [member, info] of decl.members) merged.set(member, info);
      decl.members = merged;
    }
    resolved.add(name);
  };

  for (const name of surface.declarations.keys()) resolve(name, new Set());
}

/** Every `.ts` file under a tree, declaration files excluded. */
async function sourceFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      found.push(...(await sourceFiles(path)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      found.push(path);
    }
  }
  return found.sort();
}

/** Parse one file and fold its exported declarations into the surface. */
function collectFile(surface: Surface, file: string, text: string): void {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  for (const statement of sf.statements) {
    if (!isExported(statement)) continue;
    for (const decl of declarationsOf(statement, sf, file)) {
      if (decl === undefined) {
        surface.excluded++;
        continue;
      }
      merge(surface.declarations, decl);
    }
  }
}

function isExported(node: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((one) => one.kind === ts.SyntaxKind.ExportKeyword)
  );
}

/** One statement's declarations; `undefined` marks one that was excluded as plumbing. */
function declarationsOf(
  statement: ts.Statement,
  sf: ts.SourceFile,
  file: string,
): (Decl | undefined)[] {
  if (ts.isInterfaceDeclaration(statement)) {
    const name = statement.name.text;
    const category = classifyType(name, file);
    const heritage = (statement.heritageClauses ?? [])
      .filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
      .flatMap((clause) => clause.types.map((one) => one.expression.getText(sf)));
    return [
      category && {
        name,
        category,
        file,
        members: membersOf(statement.members, sf),
        heritage: heritage.length > 0 ? heritage : undefined,
        indexSignature: indexSignatureOf(statement.members, sf),
      },
    ];
  }

  if (ts.isTypeAliasDeclaration(statement)) {
    const name = statement.name.text;
    const category = classifyType(name, file);
    return [category && { name, category, file, members: aliasMembers(statement.type, sf) }];
  }

  if (ts.isFunctionDeclaration(statement) && statement.name) {
    const name = statement.name.text;
    const category = classifyValue(name, file, "");
    return [category && { name, category, file }];
  }

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.map((one) => {
      if (!ts.isIdentifier(one.name)) return undefined;
      const name = one.name.text;
      const initializer = one.initializer?.getText(sf) ?? "";
      const category = classifyValue(name, file, initializer);
      if (!category) return undefined;
      const decl: Decl = { name, category, file };
      if (category === "queryKey") decl.queryKeyShape = queryKeyShape(one.initializer);
      return decl;
    });
  }

  return [];
}

/** Fold a declaration into the map, keeping the more specific of two records for one name. */
function merge(into: Map<string, Decl>, decl: Decl): void {
  const existing = into.get(decl.name);
  if (existing === undefined) {
    into.set(decl.name, decl);
    return;
  }
  // `export type X = typeof X[keyof typeof X]` beside `export const X = { … } as const` declares
  // one name twice; the const is what carries the shape, so it wins over the bare alias.
  if (existing.category === "type" && decl.category !== "type") into.set(decl.name, decl);
  else if (existing.members === undefined && decl.members !== undefined) into.set(decl.name, decl);
}

// ── Classification ────────────────────────────────────────────────────────────

/** Orval's per-operation plumbing, which the meta pipeline has no counterpart for. */
function isPlumbing(name: string): boolean {
  if (/^[a-z]/.test(name) && /Response(\d{3}|Success|Error)?$/.test(name)) return true;
  if (/(Query|Mutation)(Result|Error|Options|Body)$/.test(name)) return true;
  if (/^get[A-Z]\w*(QueryOptions|MutationOptions)$/.test(name)) return true;
  // The body of the successful response is not plumbing: it is the page a list screen names, and
  // module code imports it. Measured across the application, 12 files import a `…200Body` from a
  // domain package — `ListOrganizations200Body`, `ListUserAccounts200Body` and their kind — so
  // excluding it would let the migration turn each of those imports into `any` in silence, which
  // is the failure this command exists to prevent. Anything deeper under it, and every other
  // status, is the error shape nothing reads.
  if (/(^|[a-z])200Body$/.test(name)) return false;

  // A three-digit HTTP status standing as its own name segment — `GetOrganization401`,
  // `ListOrganizations200BodyPageable`. Anchored on the segment boundary so a domain type that
  // merely contains digits keeps its place in the comparison.
  return /(^|[a-z])[1-5]\d{2}([A-Z]|$)/.test(name);
}

/** Whether a file holds zod constants rather than declarations. */
function isSchemaFile(file: string): boolean {
  return file.endsWith(".zod.ts") || file.split(/[\\/]/).includes("schema");
}

/**
 * The metadata surfaces the SimpliX Meta path adds, which the OpenAPI path has no notion of: the structured
 * `@PreAuthorize` constants and the filter definitions. A name here is an addition rather than a
 * difference, so it is reported without being counted as drift.
 */
function isAddedSurface(file: string): boolean {
  const parts = file.split(/[\\/]/);
  return parts.includes("access") || parts.includes("search") || basename(file) === "_request.ts";
}

/**
 * The envelope, which the two pipelines carry differently by design.
 *
 * Orval declares `SimpliXApiResponse…` and the loose bodies it wraps, because springdoc describes
 * the wrapper as part of every response. The SimpliX Meta path maps the container `unwrap: true` — the
 * mutator strips it before React Query sees it — so the type has no client representation. Its
 * absence from the meta side is the design, not a loss.
 */
function isEnvelope(name: string): boolean {
  return /^SimpliXApiResponse/.test(name) || name === "BodyObject" || name === "ErrorDetail";
}

/**
 * The DTO an operation names as its search shape.
 *
 * Orval flattens it into the params type and declares it nowhere — measured across all thirteen of
 * the application's domains, its model directories hold zero of them. The SimpliX Meta path reaches it
 * through `request.searchDto` and emits it, which is an addition rather than a difference.
 */
function isSearchShape(name: string): boolean {
  return /SearchDTO$/.test(name);
}

/**
 * A name each pipeline invents for the same internal shape. Orval writes a request's response type
 * inline and the SimpliX Meta path names it; neither is imported anywhere outside the generated tree —
 * grepped across the application's modules and apps: 0 references.
 */
function isGeneratedAlias(name: string): boolean {
  return /(?:Response|Variables)$/.test(name);
}

function classifyType(name: string, file: string): Category | undefined {
  if (isSchemaFile(file)) return "zod";
  if (isPlumbing(name)) return undefined;
  if (isAddedSurface(file) || isGeneratedAlias(name) || isEnvelope(name) || isSearchShape(name)) {
    return "internal";
  }
  return /Params$/.test(name) ? "params" : "type";
}

function classifyValue(name: string, file: string, initializer: string): Category | undefined {
  if (/^create[A-Z]\w*Handlers$/.test(name)) return "handlers";
  if (isAddedSurface(file)) return "internal";
  if (/^use[A-Z]/.test(name)) return "hook";
  if (/^get[A-Z]\w*QueryKey$/.test(name)) return "queryKey";
  if (/^get[A-Z]\w*Url$/.test(name)) return "url";
  if (isSchemaFile(file) || /^(z|zod)\s*\./.test(initializer)) return "zod";
  if (isPlumbing(name)) return undefined;
  if (/\bas const$/.test(initializer)) return "constMap";
  return "request";
}

// ── Shapes ────────────────────────────────────────────────────────────────────

/** The `Record<K, V>` an index signature stands for, when the shape declares one. */
function indexSignatureOf(
  members: ts.NodeArray<ts.TypeElement>,
  sf: ts.SourceFile,
): string | undefined {
  for (const member of members) {
    if (!ts.isIndexSignatureDeclaration(member) || !member.type) continue;
    const key = member.parameters[0]?.type?.getText(sf) ?? "string";
    return `Record<${key}, ${normalizeType(member.type.getText(sf))}>`;
  }
  return undefined;
}

function membersOf(
  members: ts.NodeArray<ts.TypeElement>,
  sf: ts.SourceFile,
): Map<string, MemberInfo> {
  const collected = new Map<string, MemberInfo>();
  for (const member of members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
      ? member.name.text
      : member.name.getText(sf);
    collected.set(name, {
      name,
      type: normalizeType(member.type ? member.type.getText(sf) : "unknown"),
      optional: member.questionToken !== undefined,
    });
  }
  return collected;
}

/**
 * The members an alias declares.
 *
 * Orval writes a composed schema as an intersection of object literals, so the members of every
 * literal constituent belong to the one declaration; a constituent that is a bare reference
 * contributes nothing here because its own declaration is compared on its own.
 */
function aliasMembers(type: ts.TypeNode, sf: ts.SourceFile): Map<string, MemberInfo> | undefined {
  if (ts.isTypeLiteralNode(type)) return membersOf(type.members, sf);
  if (ts.isParenthesizedTypeNode(type)) return aliasMembers(type.type, sf);
  if (!ts.isIntersectionTypeNode(type)) return undefined;

  const merged = new Map<string, MemberInfo>();
  let found = false;
  for (const constituent of type.types) {
    const members = aliasMembers(constituent, sf);
    if (members === undefined) continue;
    found = true;
    for (const [name, info] of members) merged.set(name, info);
  }
  return found ? merged : undefined;
}

/**
 * The elements of the array a query key builder returns, as `"value"` or `"spread"`.
 *
 * Module code spreads the result — `[...getGetNoticeQueryKey(id), language]` — so how many
 * elements come back and in what order is contract. What each element is written as is not: one
 * pipeline interpolates the path and the other calls its URL builder, and both put one element
 * in the same place.
 */
export function queryKeyShape(initializer: ts.Expression | undefined): string[] | undefined {
  if (initializer === undefined || !ts.isArrowFunction(initializer)) return undefined;
  const body = initializer.body;

  let expression: ts.Expression | undefined;
  if (ts.isBlock(body)) {
    const returned = body.statements.find(ts.isReturnStatement);
    expression = returned?.expression;
  } else {
    expression = body;
  }

  while (expression && (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression))) {
    expression = expression.expression;
  }
  if (expression === undefined || !ts.isArrayLiteralExpression(expression)) return undefined;

  return expression.elements.map((one) => (ts.isSpreadElement(one) ? "spread" : "value"));
}

/** A type as written, with whitespace collapsed, quotes settled and union order removed. */
export function normalizeType(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").replace(/'/g, '"').trim();
  const parts = splitUnion(collapsed);
  return parts.length < 2 ? collapsed : [...parts].sort().join(" | ");
}

/** Split on the `|` that sit at nesting depth zero, so an inner union stays whole. */
export function splitUnion(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "<" || ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ">" || ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "|" && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter((one) => one !== "");
}
