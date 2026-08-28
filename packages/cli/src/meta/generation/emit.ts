import type { TypeRef } from "../ir-types.js";
import type { ResolvedDomain } from "../resolve.js";

/** The banner every generated module of a domain package opens with. */
export const HEADER = `/**
 * Generated from the DTO meta IR. Do not edit manually.
 */`;

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
