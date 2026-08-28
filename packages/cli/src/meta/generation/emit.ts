import type { ContainerMapping } from "../../openapi/orchestration/spec-profile.js";
import type { TypeRef } from "../ir-types.js";
import type { ResolvedDomain } from "../resolve.js";

/** The banner every generated module of a domain package opens with. */
export const HEADER = `/**
 * Generated from the DTO meta IR. Do not edit manually.
 */`;

/** Base name of the module every enum declaration is written into, inside the model directory. */
export const ENUM_MODULE = "_enums";

/** What a `TypeRef` of that kind is on the wire, once JSON has flattened it. */
export const PRIMITIVES: Record<
  "string" | "boolean" | "unknown" | "instant" | "date" | "time" | "file" | "binary",
  string
> = {
  string: "string",
  boolean: "boolean",
  unknown: "unknown",
  // A moment, a day and a clock time all arrive as their ISO text.
  instant: "string",
  date: "string",
  time: "string",
  file: "Blob",
  binary: "Blob",
};

/**
 * How a mapped container is spelled in TypeScript, given its arguments already rendered.
 *
 * `undefined` means the container carries no type of its own — it is unwrapped before the client
 * sees it, or the profile maps it to nothing — and the caller decides what stands in its place:
 * the argument it held, or the empty type at a position that has one.
 */
export function containerTypeExpression(
  mapping: ContainerMapping,
  rendered: string[],
  importExternal: (module: string, name: string) => void,
): string | undefined {
  if (mapping.unwrap || !mapping.ts) return undefined;
  if (mapping.import) importExternal(mapping.import, mapping.ts);

  // `Array` is written in its shorthand, which is the form the rest of the generated client and
  // every hand-written consumer of it uses.
  if (mapping.ts === "Array" && rendered.length === 1) return `${rendered[0]}[]`;
  // `Record` takes the key type as well, and the IR carries only the value: a Java `Map` has
  // string keys once JSON has serialized it, which is what the profile's `keyType` says.
  if (mapping.keyType) return `${mapping.ts}<${mapping.keyType}, ${rendered.join(", ")}>`;
  return rendered.length === 0 ? mapping.ts : `${mapping.ts}<${rendered.join(", ")}>`;
}

/**
 * One identifier out of however a tag is spelled. A tag is free text — the capture holds
 * `Auth Token` and `OAuth2 Social Login` beside the dotted ones — and a space in the name would
 * write a module no import specifier can reach.
 */
export function camelJoin(text: string): string {
  return text
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part !== "")
    .map((part, at) =>
      at === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

/**
 * The module one entity is written into, from its tag: the last dot-segment as an identifier.
 * Every generator that writes a file per entity uses it, so one entity's model, schema, endpoints
 * and hooks are found under the same name.
 */
export function entityModuleBase(tag: string): string {
  return camelJoin(tag.slice(tag.lastIndexOf(".") + 1));
}

/** A wire name Jackson produced is usually an identifier, and is quoted when it is not. */
export function memberName(name: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

/** Every type reference an operation of the domain returns. */
export function responseRefs(domain: ResolvedDomain): TypeRef[] {
  return domain.operations
    .map((operation) => operation.response)
    .filter((ref): ref is TypeRef => ref !== undefined);
}

/** Every type reference an operation of the domain is sent. */
export function requestRefs(domain: ResolvedDomain): TypeRef[] {
  const refs: TypeRef[] = [];
  for (const operation of domain.operations) {
    if (operation.request.body) refs.push(operation.request.body);
    if (operation.request.searchDto) refs.push({ kind: "ref", name: operation.request.searchDto });
    for (const param of operation.request.query) refs.push(param.type);
    for (const param of operation.request.path) refs.push(param.type);
  }
  return refs;
}

/**
 * The types those references carry, following inheritance upward: an ancestor's fields are part
 * of the shape a descendant is sent as, and the descendant's declaration leaves them there.
 *
 * Which side of the wire a type is carried on decides how its labeled enums are spelled, so the
 * model and the schema generators have to answer it the same way or the two disagree about the
 * same field.
 */
export function reachableFrom(domain: ResolvedDomain, seeds: TypeRef[]): Set<string> {
  const reached = new Set<string>();

  const fromRef = (ref: TypeRef): void => {
    switch (ref.kind) {
      case "ref":
        fromType(ref.name);
        for (const arg of ref.args ?? []) fromRef(arg);
        break;
      case "container":
        for (const arg of ref.args) fromRef(arg);
        break;
      case "pick":
        fromType(ref.of);
        break;
      default:
        break;
    }
  };

  const fromType = (name: string): void => {
    if (reached.has(name)) return;
    const type = domain.types.get(name);
    if (!type) return;
    reached.add(name);
    if (type.meta.extends) fromType(type.meta.extends);
    for (const field of type.meta.fields) fromRef(field.type);
  };

  for (const seed of seeds) fromRef(seed);
  return reached;
}
