import type { ContainerMapping } from "@simplix-react/cli";

/**
 * Every Java container the simplix-boot DTO meta IR can name, and what it becomes in generated
 * TypeScript. The IR spells a container as the backend does; this table is where a Spring name
 * turns into a client type and a zod factory.
 *
 * A container absent from this table has no client representation, so codegen cannot emit its
 * type — `container-types.test.ts` walks the captured IR and fails when a backend introduces one
 * that is not listed here.
 */
export const bootContainerTypes: Record<string, ContainerMapping> = {
  // src/mutator.ts unwraps the envelope, so React Query's `data` is already the body.
  SimpliXApiResponse: { unwrap: true },
  Page: {
    ts: "SpringPage",
    zod: "pageOf",
    import: "@simplix-react-ext/simplix-boot-auth",
  },
  List: { ts: "Array", zod: "z.array" },
  // The IR's `Map` carries one argument — the value — because the backend's TypeRefMapper maps
  // `resolvable.getGeneric(1)` and drops the key. `keyType` supplies what it dropped: TypeScript
  // needs `Record<string, V>`, and zod v4's `z.record` requires both arguments,
  // `z.record(z.string(), V)`.
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};
