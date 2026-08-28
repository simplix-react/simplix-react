import type { OpenApiNamingStrategy } from "../../openapi/naming/naming-strategy.js";
import type { AccessMeta } from "../ir-types.js";
import type { ResolvedDomain } from "../resolve.js";
import { HEADER } from "./emit.js";
import {
  jsDoc,
  resolveEndpoints,
  type EndpointEntity,
  type EndpointTarget,
} from "./endpoint-gen.js";

/** Directory the access modules land in, relative to a generated package's meta root. */
export const ACCESS_DIR = "access";

/** Module the emitted constants are typed against, inside {@link ACCESS_DIR}. */
const ACCESS_MODULE = "_access";

export interface AccessGenOptions {
  /** Contributed by the spec profile, and the same one the endpoints were generated with. */
  naming: OpenApiNamingStrategy;
}

/**
 * An operation guarded by a SpEL expression. The IR carries it as written, because there is no
 * structure left in it to carry: the expression calls a bean, or joins two permissions with a
 * word. Nothing on this side can evaluate it, so a screen that reads one asks the server.
 */
export interface AccessExpression {
  operation: string;
  raw: string;
}

export interface AccessGenResult {
  /** Path relative to the meta output root → file content. */
  files: Map<string, string>;
  /** How many of the emitted constants each kind carries, which is one per declared name. */
  kinds: Record<AccessMeta["kind"], number>;
  expressions: AccessExpression[];
}

/**
 * Emit one module per entity holding what each of its operations requires of the caller, and the
 * barrel over them.
 *
 * The IR carries `@PreAuthorize` already taken apart, so nothing here parses SpEL: a permission
 * arrives as the group and the action it names, and only an expression the annotation built out of
 * several of them arrives as text. Nothing generated reads these constants — whether a screen
 * hides a control it may not use, or shows it and lets the server refuse, is the application's
 * decision — so they are emitted and left for it to adopt.
 */
export function generateAccessFiles(
  domain: ResolvedDomain,
  options: AccessGenOptions,
): AccessGenResult {
  const entities = resolveEndpoints(domain, options.naming);
  const files = new Map<string, string>();
  const kinds: Record<AccessMeta["kind"], number> = {
    permission: 0,
    authenticated: 0,
    public: 0,
    expression: 0,
  };
  const expressions: AccessExpression[] = [];

  for (const entity of entities) {
    const declared = declarable(entity);
    if (declared.length === 0) continue;
    files.set(`${ACCESS_DIR}/${entity.file}.ts`, entityFile(declared));
    for (const target of declared) {
      const access = target.operation.access;
      kinds[access.kind] += 1;
      if (access.kind === "expression") {
        expressions.push({ operation: target.operation.id, raw: access.raw });
      }
    }
  }

  if (files.size > 0) {
    files.set(`${ACCESS_DIR}/${ACCESS_MODULE}.ts`, accessTypes());
    files.set(`${ACCESS_DIR}/index.ts`, barrel(entities.filter((one) => one.targets.length > 0)));
  }

  return { files, kinds, expressions };
}

/**
 * The operations of an entity that can each own a constant.
 *
 * A name two operations of one entity resolve to keeps the first: one name is one declaration, and
 * a module that declares the same name twice does not compile — which would take the whole package
 * with it rather than the one rule. The collision itself is already reported by the endpoint
 * generator, which names its request functions the same way.
 */
function declarable(entity: EndpointEntity): EndpointTarget[] {
  const declared: EndpointTarget[] = [];
  const taken = new Set<string>();
  for (const target of entity.targets) {
    if (taken.has(target.name)) continue;
    taken.add(target.name);
    declared.push(target);
  }
  return declared;
}

/** The barrel over the directory, which every module of it is reachable through. */
function barrel(entities: EndpointEntity[]): string {
  const modules = entities.map((entity) => entity.file).sort();
  return [HEADER, "", ...modules.map((name) => `export * from './${name}';`), ""].join("\n");
}

/** One entity's module: what each of its operations requires of the caller. */
function entityFile(targets: EndpointTarget[]): string {
  const bodies = targets.map((target) => {
    const requires = `What \`${target.name}\` requires of the caller.`;
    return `${jsDoc(requires)}
export const ${target.name}Access: AccessRule = ${literal(target)};
`;
  });

  return [
    HEADER,
    "",
    "// Nothing generated reads these: a screen adopts them by asking one before it shows a",
    "// control, and the server refuses the call either way.",
    `import type { AccessRule } from './${ACCESS_MODULE}';`,
    "",
    ...bodies,
  ].join("\n");
}

/** One operation's rule, written as the object literal the emitted module declares. */
function literal(target: EndpointTarget): string {
  const access = target.operation.access;
  switch (access.kind) {
    case "permission":
      return `{ kind: "permission", group: ${JSON.stringify(access.group)}, action: ${JSON.stringify(access.action)} }`;
    case "expression":
      return `{ kind: "expression", raw: ${JSON.stringify(access.raw)} }`;
    default:
      return `{ kind: ${JSON.stringify(access.kind)} }`;
  }
}

/** The shapes the emitted constants are typed against, mirroring the IR's own `AccessMeta`. */
function accessTypes(): string {
  return `${HEADER}

/**
 * What an operation requires of the caller, as \`@PreAuthorize\` states it.
 *
 * - \`permission\` — the caller holds \`action\` on \`group\`.
 * - \`authenticated\` — any signed-in caller.
 * - \`public\` — no caller identity at all.
 * - \`expression\` — a SpEL expression nothing on this side evaluates; \`raw\` is it as written.
 */
export type AccessRule =
  | { kind: 'permission'; group: string; action: string }
  | { kind: 'authenticated' }
  | { kind: 'public' }
  | { kind: 'expression'; raw: string };
`;
}
