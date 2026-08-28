# DTO Meta Codegen — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@simplix-react/cli` reads the backend's DTO metadata IR and generates TypeScript types, zod schemas, request functions, React Query hooks, MSW handlers, filter/permission configuration — in parallel with the existing orval output, so a domain can be moved across one at a time and moved back by reverting one config line.

**Architecture:** A new `packages/cli/src/meta/` reads the IR (from the dev endpoint or a committed snapshot), resolves it, and hands a shared shape to per-concern generators that write into `src/generated-meta/`. The existing `packages/cli/src/openapi/` is not touched. A `meta-diff` command compares the two outputs so a domain is only switched once they agree.

**Tech Stack:** TypeScript, Node 22+, the existing CLI plugin registry, zod v4, TanStack Query, MSW.

**Spec:** `docs/design/2026-08-28-dto-meta-codegen.md` (Korean). Sections referenced below by number.

---

## The IR is real — do not invent fixtures

The backend half of this project is finished and a real IR was captured from the smart-safety application. It lives at:

`packages/cli/src/meta/__fixtures__/smart-safety-meta.json` (2.7 MB)

**Every generator test in this plan runs against that file.** Measured contents:

| | |
| --- | --- |
| operations | 694 |
| types | 637 (104 of them carry `extends`) |
| enums | 133 (122 labeled, every value carrying a `labelKey`) |
| containers in use | `SimpliXApiResponse` 648 · `List` 356 · `Page` 93 · `Map` 74 |
| field kinds | `string` 3110 · `number` 936 · `instant` 682 · `boolean` 593 · `enum` 541 · `container` 279 · `date` 202 · `ref` 134 · `time` 10 · `unknown` 8 · `param` 6 |
| constraints | `maxLength` 440 · `notBlank` 221 · `notEmpty` 11 · `pattern` 10 · `email` 7 · `min` 7 · `minLength` 5 · `max` 4 |
| access kinds | `permission` 566 · `authenticated` 94 · `public` 29 · `expression` 5 |
| `searchDto`-bearing operations | 86 |
| fields with `searchable` | 1118 |
| fields with `labelKey` | 2082 |
| distinct tags | 139 |

Those numbers are the yardstick. A generator that silently drops a field kind will show up as a count that does not match.

## Facts that bind every task

- **Repository:** `/Users/taehwan/Workspace/accesscore/simplix-react`, branch `feat/dto-meta-codegen`. Two files under `packages/ui/src/base/charts/` were dirty before this work began — they belong to somebody else; never stage them.
- **Never touch `packages/cli/src/openapi/`.** The orval path must keep working for every domain not yet moved.
- Commit messages: English conventional commits, **no AI attribution of any kind**.
- `pnpm` workspace. Tests: `pnpm --filter @simplix-react/cli test`. Typecheck: `pnpm typecheck`. Lint: `pnpm lint`.
- Comments and TSDoc in English (repo rule); the design spec is Korean and is not a template for code comments.

---

### Task 1: IR types, mirrored from the committed Java records

**Files:**
- Create: `packages/cli/src/meta/ir-types.ts`
- Test: `packages/cli/src/meta/__tests__/ir-types.test.ts`

The Java records are committed at
`/Users/taehwan/Workspace/simplix/simplix/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/`.
Mirror them exactly — component names, optionality, and the `extends` rename.

- [ ] **Step 1: Write the types**

```ts
/** One entry of the discriminated type reference. `kind` selects which members are present. */
export type TypeRef =
  | { kind: "string" | "boolean" | "unknown" | "instant" | "date" | "file" | "binary" }
  | { kind: "number"; integral: boolean }
  | { kind: "time"; pattern?: string }
  | { kind: "enum"; name: string }
  | { kind: "ref"; name: string; args?: TypeRef[] }
  | { kind: "param"; name: string }
  | { kind: "container"; name: string; args: TypeRef[] }
  | { kind: "pick"; of: string; fields: string[] };

/** A validation constraint. `value` is a JSON number for `@Min`/`@Max` and a JSON string for
 *  `@DecimalMin`/`@DecimalMax` — both land on the same `min`/`max` kind, so read the runtime type. */
export interface ConstraintMeta {
  kind: string;
  value?: number | string;
  name?: string;
}

export interface SearchableMeta {
  operators: string[];
  sortable: boolean;
  entityField?: string;
  sortField?: string;
}

export interface FieldMeta {
  name: string;
  type: TypeRef;
  /** Always present — an unboxed Java boolean, so `false` is emitted rather than omitted. */
  required: boolean;
  /** Always present, same reason. */
  nullable: boolean;
  description?: string;
  labelKey?: string;
  label?: string;
  constraints?: ConstraintMeta[];
  searchable?: SearchableMeta;
}

export interface TypeMeta {
  javaClass: string;
  /** Parent type name. This type carries ONLY its own fields; the parent carries the rest. */
  extends?: string;
  /** Always present; empty for a non-generic DTO. */
  typeParams: string[];
  description?: string;
  fields: FieldMeta[];
}

export interface EnumValueMeta {
  name: string;
  labelKey?: string;
}

export interface EnumMeta {
  /** Always present. `true` means the wire shape is `{"value":"…","label":"…"}`. */
  labeled: boolean;
  values: EnumValueMeta[];
}

export type AccessMeta =
  | { kind: "permission"; group: string; action: string }
  | { kind: "authenticated" }
  | { kind: "public" }
  | { kind: "expression"; raw: string };

export interface ParamMeta {
  name: string;
  type: TypeRef;
  required: boolean;
  description?: string;
}

export interface RequestMeta {
  body?: string;
  contentType?: string;
  query: ParamMeta[];
  path: ParamMeta[];
  /** The DTO whose `@SearchableField`s define this operation's flattened search params. */
  searchDto?: string;
}

export interface OperationMeta {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  tag: string;
  summary?: string;
  request: RequestMeta;
  /** Container-wrapped. Absent for a Void response. */
  response?: TypeRef;
  access: AccessMeta;
}

export interface DtoMeta {
  version: number;
  enums: Record<string, EnumMeta>;
  types: Record<string, TypeMeta>;
  operations: OperationMeta[];
  extensions?: Record<string, unknown>;
}
```

**Why some members are optional and others are not:** the Java records carry `@JsonInclude(NON_NULL)`, which drops a `null` member entirely but never drops an unboxed primitive and never drops an empty collection. So `required`, `nullable`, `sortable`, `labeled`, `version` and `typeParams` are always present, while `description`, `labelKey`, `extends`, `summary`, `response` and `extensions` vanish when absent. Getting this backwards produces types that lie about the payload (spec §4).

- [ ] **Step 2: Write the test — it reads the real IR**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { DtoMeta } from "../ir-types.js";

const ir: DtoMeta = JSON.parse(
  readFileSync(join(__dirname, "../__fixtures__/smart-safety-meta.json"), "utf-8"),
);

describe("ir-types", () => {
  it("types the captured IR without a cast", () => {
    expect(ir.version).toBe(1);
    expect(Object.keys(ir.types)).toHaveLength(637);
    expect(Object.keys(ir.enums)).toHaveLength(133);
    expect(ir.operations).toHaveLength(694);
  });

  it("every field carries required and nullable", () => {
    const missing = Object.values(ir.types).flatMap((t) =>
      t.fields.filter((f) => typeof f.required !== "boolean" || typeof f.nullable !== "boolean"),
    );
    expect(missing).toEqual([]);
  });

  it("every type carries typeParams even when empty", () => {
    const missing = Object.values(ir.types).filter((t) => !Array.isArray(t.typeParams));
    expect(missing).toEqual([]);
  });

  it("104 types carry extends and each lists only its own fields", () => {
    const derived = Object.values(ir.types).filter((t) => t.extends);
    expect(derived).toHaveLength(104);
  });

  it("every labeled enum value carries a labelKey", () => {
    const labeled = Object.values(ir.enums).filter((e) => e.labeled);
    expect(labeled.length).toBeGreaterThan(100);
    expect(labeled.every((e) => e.values.every((v) => v.labelKey))).toBe(true);
  });

  it("only the four known containers appear", () => {
    const names = new Set<string>();
    const walk = (t?: TypeRefLike) => {
      if (!t) return;
      if (t.kind === "container") names.add(t.name);
      t.args?.forEach(walk);
    };
    type TypeRefLike = { kind: string; name?: string; args?: TypeRefLike[] };
    for (const op of ir.operations) walk(op.response as TypeRefLike | undefined);
    for (const t of Object.values(ir.types)) for (const f of t.fields) walk(f.type as TypeRefLike);
    expect([...names].sort()).toEqual(["List", "Map", "Page", "SimpliXApiResponse"]);
  });
});
```

- [ ] **Step 3: Run it**

`pnpm --filter @simplix-react/cli test -- ir-types`
Expected: all green. A count mismatch means the fixture was regenerated against a different backend — stop and report rather than editing the numbers.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/meta/ir-types.ts packages/cli/src/meta/__tests__/ir-types.test.ts \
        packages/cli/src/meta/__fixtures__/smart-safety-meta.json
git commit -m "feat(cli): mirror the DTO meta IR as TypeScript types"
```

---

### Task 2: Fetch the IR from an endpoint or a snapshot

**Files:**
- Create: `packages/cli/src/meta/fetch.ts`
- Test: `packages/cli/src/meta/__tests__/fetch.test.ts`

- [ ] **Step 1: Write it**

```ts
import { readFile, writeFile } from "node:fs/promises";
import type { DtoMeta } from "./ir-types.js";

/** The IR version this CLI understands. A newer document is refused rather than read partially. */
export const SUPPORTED_IR_VERSION = 1;

export interface FetchMetaOptions {
  /** Endpoint URL, or a path to a committed snapshot. */
  source: string;
  /** When set, a fetched IR is written here so a later run can work offline. */
  snapshot?: string;
  /** Read `snapshot` instead of `source`. */
  offline?: boolean;
}

export async function fetchMeta(options: FetchMetaOptions): Promise<DtoMeta> {
  const raw = options.offline
    ? await readSnapshot(options)
    : await readSource(options.source);
  const meta = unwrap(raw);
  assertVersion(meta);
  if (options.snapshot && !options.offline) {
    await writeFile(options.snapshot, JSON.stringify(meta, null, 2), "utf-8");
  }
  return meta;
}
```

Fill in the four helpers:

- `readSource` — an `http://`/`https://` source is fetched; anything else is read from disk. A non-2xx response throws with the status AND the response body, because the backend answers a duplicate type name with a 409 whose body names both classes; swallowing it would leave the operator guessing.
- `readSnapshot` — throws a clear error naming the path when `snapshot` is unset or missing.
- `unwrap` — the endpoint wraps the IR in the SimpliX envelope (`{type, message, body, …}`). Return `body` when the payload looks like an envelope, the payload itself otherwise, so a hand-saved snapshot of either shape works.
- `assertVersion` — refuse a `version` greater than `SUPPORTED_IR_VERSION` with a message telling the operator to upgrade the CLI. A newer document may carry members this CLI would silently drop (spec §5.1).

- [ ] **Step 2: Test it**

Cover: reading the real fixture from disk; unwrapping an enveloped payload; unwrapping a bare payload; refusing `version: 2`; a missing snapshot path producing an error that names the path; and a non-2xx HTTP response surfacing the body text. Stub `fetch` rather than opening a socket.

- [ ] **Step 3: Run, then commit**

```bash
pnpm --filter @simplix-react/cli test -- fetch
git add packages/cli/src/meta/fetch.ts packages/cli/src/meta/__tests__/fetch.test.ts
git commit -m "feat(cli): read the DTO meta IR from an endpoint or a snapshot"
```

---

### Task 3: `LabeledEnumValue<T>` in the boot extension

**Files:**
- Create: `extensions/simplix-boot/packages/utils/src/labeled-enum-value.ts`
- Modify: `extensions/simplix-boot/packages/utils/src/index.ts`
- Test: `extensions/simplix-boot/packages/utils/src/__tests__/labeled-enum-value.test.ts`

`resolveBootEnum` already lives in this package and takes `unknown`, because nothing described the wire shape. The IR does now: a labeled enum serializes as `{"value":"ACTIVE","label":"활성"}` (spec §4.1).

- [ ] **Step 1: Write it**

```ts
/**
 * A labeled enum value as the Boot backend sends it.
 *
 * The server serializes an enum implementing `LabeledEnum` as an object, not a bare string, so
 * a response field holding one is `LabeledEnumValue<"ACTIVE" | "RETIRED">` rather than the union
 * itself. Comparing such a field to a bare string is a type error — which is the point: it was
 * previously a silent runtime falsehood.
 */
export interface LabeledEnumValue<T extends string = string> {
  value: T;
  label: string;
}
```

Export it from the package barrel next to `resolveBootEnum`.

- [ ] **Step 2: Test** that `resolveBootEnum` accepts a `LabeledEnumValue` and returns its `value`, and that a plain string still round-trips. Then commit:

```bash
git add extensions/simplix-boot/packages/utils/src/labeled-enum-value.ts \
        extensions/simplix-boot/packages/utils/src/index.ts \
        extensions/simplix-boot/packages/utils/src/__tests__/labeled-enum-value.test.ts
git commit -m "feat(boot-utils): type the labeled enum wire shape"
```

---

### Task 4: Container mapping in the boot CLI plugin

**Files:**
- Modify: `packages/cli/src/openapi/orchestration/spec-profile.ts` — add the meta fields to `SpecProfile`
- Modify: `extensions/simplix-boot/packages/cli-plugin/src/index.ts` — register them
- Create: `extensions/simplix-boot/packages/cli-plugin/src/container-types.ts`
- Test: `extensions/simplix-boot/packages/cli-plugin/src/__tests__/container-types.test.ts`

The IR names containers by their JAVA names; which TypeScript type each becomes is the profile's decision (spec §4.1). Measured usage: `SimpliXApiResponse` 648, `List` 356, `Page` 93, `Map` 74 — those four and no others.

- [ ] **Step 1: Write the mapping**

```ts
export interface ContainerMapping {
  /** The TypeScript type name, or absent when the container disappears from client types. */
  ts?: string;
  /** The zod factory that wraps the inner schema. */
  zod?: string;
  /** Module the TS type and zod factory are imported from. */
  import?: string;
  /** The mutator strips this container before React Query sees it, so it has no client type. */
  unwrap?: boolean;
  /** For `Map`: the key type, which the IR does not carry. */
  keyType?: string;
}

export const bootContainerTypes: Record<string, ContainerMapping> = {
  // src/mutator.ts unwraps the envelope, so React Query's `data` is already the body.
  SimpliXApiResponse: { unwrap: true },
  Page: {
    ts: "SpringPage",
    zod: "pageOf",
    import: "@simplix-react-ext/simplix-boot-auth",
  },
  List: { ts: "Array" },
  Map: { ts: "Record", keyType: "string" },
};
```

`SpringPage`, `pageOf` and `springPageSchema` already exist in `@simplix-react-ext/simplix-boot-auth` — do not redefine them.

- [ ] **Step 2: Extend `SpecProfile`** with `metaEndpoint?: string`, `metaDownloader?`, and `containerTypes?: Record<string, ContainerMapping>`, all optional so existing profiles are unaffected. Register the boot values in the plugin's `registerPlugin` call, endpoint `/api/v1/dev/meta/dto`.

- [ ] **Step 3: Test** that every container name appearing in the real fixture has a mapping — this is the assertion that catches a backend adding a container the plugin does not know:

```ts
const used = new Set<string>();
// walk the fixture as in Task 1's test
expect([...used].filter((n) => !(n in bootContainerTypes))).toEqual([]);
```

- [ ] **Step 4: Run `pnpm --filter @simplix-react/cli test`, `pnpm typecheck`, then commit**

```bash
git add packages/cli/src/openapi/orchestration/spec-profile.ts \
        extensions/simplix-boot/packages/cli-plugin/src/container-types.ts \
        extensions/simplix-boot/packages/cli-plugin/src/index.ts \
        extensions/simplix-boot/packages/cli-plugin/src/__tests__/container-types.test.ts
git commit -m "feat(boot-plugin): map IR container names to TypeScript types"
```

---

### Task 5: Resolve the IR into a per-domain shape

**Files:**
- Create: `packages/cli/src/meta/resolve.ts`
- Test: `packages/cli/src/meta/__tests__/resolve.test.ts`

The generators need the IR sliced by domain and indexed. This task does that once so no generator re-walks the document.

- [ ] **Step 1: Write it.** `resolveMeta(meta, { domains, containerTypes })` returns, per domain name:
  - the operations whose `tag` matches that domain's tag patterns (same matching rule the orval path uses — exact string or `/regex/`)
  - the transitive closure of types those operations reach, by walking `request.body`, `request.searchDto`, `response`, and each type's `extends` and `ref`/`pick` fields
  - the enums reached the same way
  - for each type, its full field list including inherited ones, computed by following `extends` — **kept separate from the own-field list**, because the generated `interface X extends Y` must emit only own fields while a zod schema built with `.extend()` needs to know the parent

  Report an operation whose `tag` matches no domain rather than dropping it silently.

- [ ] **Step 2: Test against the real fixture.** Assert that resolving with a single catch-all domain reaches all 637 types; that a domain's closure never contains a type none of its operations reach; that `extends` chains resolve (the fixture has 104); and that a type whose parent is outside the domain still pulls the parent in.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/meta/resolve.ts packages/cli/src/meta/__tests__/resolve.test.ts
git commit -m "feat(cli): resolve the IR into per-domain type closures"
```

---

### Task 6: Model generator — interfaces, enums, envelope-free

**Files:**
- Create: `packages/cli/src/meta/generation/model-gen.ts`
- Test: `packages/cli/src/meta/__tests__/model-gen.test.ts`

- [ ] **Step 1: Write it.** For one domain, emit:
  - `model/<entity>.ts` — one `export interface` per type, `extends` where the IR says so, **own fields only**
  - `model/_enums.ts` — for each enum: a value union plus a const map named as orval named it (so `SiteOnboardingStepKey` keeps working as a value import), and for a labeled enum an additional `…Labeled` alias over `LabeledEnumValue`
  - no envelope type — `SimpliXApiResponse` is `unwrap: true`, so it does not appear in client types

  Field typing rules, from the measured kinds: `string`→`string`; `number`→`number`; `boolean`→`boolean`; `instant`/`date`→`string`; `time`→`string`; `enum`→ the value union in a request DTO and the `…Labeled` alias in a response DTO (spec §9); `ref`→ the interface name; `container`→ the plugin's mapping; `unknown`→`unknown`; `param`→ the type parameter; `pick`→ `Pick<Of, "a" | "b">`.

  A field is optional (`?`) exactly when `required` is false.

- [ ] **Step 2: Test against the real fixture.** Generate for a domain and assert: an `extends` type emits only its own fields; a response enum field is the `Labeled` alias while the same enum in a request DTO is the union; no `SimpliXApiResponse` appears anywhere in the output; every one of the 11 field kinds present in the fixture produces valid TypeScript. Compile the generated text with the TypeScript compiler API and assert zero diagnostics — that is the assertion that actually proves the output is usable.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/meta/generation/model-gen.ts packages/cli/src/meta/__tests__/model-gen.test.ts
git commit -m "feat(cli): generate TypeScript models from the IR"
```

---

### Task 7: Schema generator — zod with inheritance and constraints

**Files:**
- Create: `packages/cli/src/meta/generation/schema-gen.ts`
- Test: `packages/cli/src/meta/__tests__/schema-gen.test.ts`

This is where the project's original complaint is answered: 440 `maxLength` and 221 `notBlank` constraints reach the client.

- [ ] **Step 1: Write it.** Emit `schema/<entity>.ts`, one const per type, named as orval named it (`XRestCreateBody`) so `schemas.ts` keeps resolving. A type with `extends` is built as `parentSchema.extend({ …own fields… })`.

  Constraint mapping (spec §5): `notBlank`→`.trim().min(1)`; `notEmpty`→`.min(1)`; `minLength`/`maxLength`→`.min()`/`.max()`; `minItems`/`maxItems`→`.min()`/`.max()` on the array; `min`/`max`→`.min()`/`.max()` — **coercing the value, because `@DecimalMin` sends a JSON string while `@Min` sends a number** (spec §5); `positive`/`nonnegative`/`negative`/`nonpositive`→ the matching zod call; `pattern`→`.regex(new RegExp(...))`; `email`→`.email()`; `assertTrue`/`assertFalse`→`z.literal(true)`/`z.literal(false)`; `custom`→ **no zod call**, emit a comment naming it as a server-only check.

  A non-required field gets `.optional()`.

- [ ] **Step 2: Test against the real fixture.** Assert: a `notBlank` field rejects `""` at runtime (build the schema with `new Function` or import the emitted module) — this is the exact defect the project exists to fix, so prove it rather than asserting on generated text; a `maxLength` field rejects an over-long string; a `@DecimalMin`-sourced string bound produces a working numeric `.min()`; a `custom` constraint emits a comment and no call; an `extends` type's schema validates a parent field.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/meta/generation/schema-gen.ts packages/cli/src/meta/__tests__/schema-gen.test.ts
git commit -m "feat(cli): generate zod schemas carrying the server's constraints"
```

---

### Task 8: Endpoint and hook generators

**Files:**
- Create: `packages/cli/src/meta/generation/endpoint-gen.ts`
- Create: `packages/cli/src/meta/generation/hook-gen.ts`
- Test: `packages/cli/src/meta/__tests__/endpoint-hook-gen.test.ts`

- [ ] **Step 1: Write them.** Request functions go through `src/mutator.ts`'s `getMutator("boot")` — the same mutator the orval path uses, so the envelope is unwrapped in one place and `data` has the same shape on both paths (spec §8).

  Hooks use the profile's naming strategy (`simplixBootNaming`) so the exported names match what orval produced. **This is not cosmetic** — the migration switches a barrel, and module code imports hooks by name (spec §11).

  Query keys: the first element is the request URL string and a list key carries the params object, because `useInvalidateEntity` invalidates by URL prefix on `queryKey[0]` (spec §5.1). A different key shape breaks cache invalidation with no error.

- [ ] **Step 2: Test against the real fixture.** Assert: a generated hook's name equals what `simplixBootNaming` yields for the same operation; a query key's first element is the URL; a list hook's key carries params; a `Void` response produces a hook with no data type; a multipart operation sends `FormData`; a `binary` response produces a function returning `Blob` rather than a hook.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/meta/generation/endpoint-gen.ts \
        packages/cli/src/meta/generation/hook-gen.ts \
        packages/cli/src/meta/__tests__/endpoint-hook-gen.test.ts
git commit -m "feat(cli): generate request functions and React Query hooks from the IR"
```

---

### Task 9: Search and access generators

**Files:**
- Create: `packages/cli/src/meta/generation/search-gen.ts`
- Create: `packages/cli/src/meta/generation/access-gen.ts`
- Test: `packages/cli/src/meta/__tests__/search-access-gen.test.ts`

1118 fields carry `searchable` and 86 operations name a `searchDto`. Today the frontend re-derives filter operators by matching parameter-name suffixes with a regex; the IR states them.

- [ ] **Step 1: `search-gen`.** For each operation with a `searchDto`, emit that DTO's fields as filter definitions: the operator list from `searchable.operators`, `sortable` for the column, and the label from `labelKey`. Follow the project's filter rules — boolean fields become `type: "toggle"` never a two-option facet, enum and FK fields become `type: "faceted"`, and the emitted `FilterBar` config carries `maxBadges: 3`.

- [ ] **Step 2: `access-gen`.** For each operation, emit a permission constant from `AccessMeta`. `permission` becomes the group/action pair the `useCan` gate takes. `authenticated` and `public` need no gate. **`expression` emits no gate at all** — it emits a comment carrying the raw SpEL, so the person building that screen decides (spec §5.1). The fixture has 5 of these; a generator that treated them as "no permission required" would hide those screens' buttons or expose them wrongly.

- [ ] **Step 3: Test against the real fixture.** Assert the operator lists match the IR rather than being re-derived; a boolean searchable field yields a toggle; the 5 `expression` operations yield a comment and no gate; every `permission` operation yields a group and an action.

- [ ] **Step 4: Run, then commit**

```bash
git add packages/cli/src/meta/generation/search-gen.ts \
        packages/cli/src/meta/generation/access-gen.ts \
        packages/cli/src/meta/__tests__/search-access-gen.test.ts
git commit -m "feat(cli): generate filter and permission configuration from the IR"
```

---

### Task 10: Mock generator

**Files:**
- Create: `packages/cli/src/meta/generation/mock-gen.ts`
- Test: `packages/cli/src/meta/__tests__/mock-gen.test.ts`

- [ ] **Step 1: Write it.** Emit MSW handlers per operation and seeds per entity, wrapping responses in the envelope with `wrapEnvelope` from `@simplix-react-ext/simplix-boot-auth`. **`src/mock/seeds.ts` is preserved across regenerations** — the existing rule, unchanged (spec §8).

- [ ] **Step 2: Test** that a handler returns an enveloped body, that a `Page` response is shaped like `SpringPage`, and that regenerating does not overwrite an existing seeds file.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/meta/generation/mock-gen.ts packages/cli/src/meta/__tests__/mock-gen.test.ts
git commit -m "feat(cli): generate MSW handlers and seeds from the IR"
```

---

### Task 11: Wire parallel generation into the CLI

**Files:**
- Modify: `packages/cli/src/config/types.ts` — the `meta` block on `OpenAPISpecConfig`
- Modify: `packages/cli/src/commands/openapi.ts` — run the meta pipeline alongside orval
- Create: `packages/cli/src/meta/write.ts` — the layout writer
- Test: `packages/cli/src/__tests__/meta-parallel.test.ts`

- [ ] **Step 1: Config.** Add to `OpenAPISpecConfig`:

```ts
meta?: {
  /** Endpoint URL or snapshot path. */
  source: string;
  /** Where a fetched IR is written for offline regeneration. */
  snapshot?: string;
  /** Domains whose barrel exports the meta output instead of the orval output. */
  export?: string[];
};
```

- [ ] **Step 2: Layout.** Write into `packages/domain-<name>/src/generated-meta/` — `model/`, `schema/`, `endpoints/`, `hooks/`, `search/`, `access/`, `mock/`, `index.ts`. Leave `src/generated/` alone.

- [ ] **Step 3: The re-export layer.** For a domain listed in `export`, rewrite `index.ts`, `hooks/*.ts`, `schemas.ts` and `mock/index.ts` to point at the meta output. `schemas.ts` and `mock/index.ts` carry hand-edited regions — preserve them and change only the relative import paths (spec §10). Reverting is removing the domain from `export`, which is why `src/generated/` is deleted last.

- [ ] **Step 4: Test** that a domain not in `export` keeps its orval barrel byte-for-byte; that a domain in `export` has all four re-export files repointed; that a hand-edited region in `schemas.ts` survives.

- [ ] **Step 5: Run the full CLI suite, then commit**

```bash
pnpm --filter @simplix-react/cli test
git add packages/cli/src/config/types.ts packages/cli/src/commands/openapi.ts \
        packages/cli/src/meta/write.ts packages/cli/src/__tests__/meta-parallel.test.ts
git commit -m "feat(cli): generate the meta output alongside orval and switch by config"
```

---

### Task 12: `meta-diff`

**Files:**
- Create: `packages/cli/src/commands/meta-diff.ts`
- Modify: `packages/cli/src/bin.ts` — register the command
- Test: `packages/cli/src/__tests__/meta-diff.test.ts`

The reason parallel generation was chosen: a domain is only switched once the two outputs agree.

- [ ] **Step 1: Write it.** `simplix meta-diff <domain>` compares the public names each output exports and reports (spec §11):

| Finding | Level |
| --- | --- |
| a public name (type, hook, const map, params, schema) present in only one | error |
| a field present in only one | error |
| a field type mismatch | error |
| a required-ness difference not on the intended list | error |
| a missing operation | error |
| a constraint present only on the meta side | info — OpenAPI lost it, which is the point |

  **Intended differences are info, not errors:** a response enum field moving from a value union to `LabeledEnumValue`; a field becoming required through a primitive type or `@Schema(requiredMode = REQUIRED)`; added request constraints. Reporting those as errors would bury real drift in noise.

  Both outputs must come from the same run against the same server, or the diff reports whatever the backend did in between.

- [ ] **Step 2: Test** that an identical pair reports nothing; that a removed field is an error; that an enum shape change is info; that a hook-name difference is an error.

- [ ] **Step 3: Run, then commit**

```bash
git add packages/cli/src/commands/meta-diff.ts packages/cli/src/bin.ts \
        packages/cli/src/__tests__/meta-diff.test.ts
git commit -m "feat(cli): add meta-diff to compare the orval and meta outputs"
```

---

### Task 13: Scaffold reads the IR

**Files:**
- Create: `packages/cli/src/meta/scaffold-source.ts`
- Modify: `packages/cli/src/commands/scaffold-crud.ts` — choose the source
- Modify: `packages/cli/src/templates/openapi/user-index-ts.hbs` — variable re-export path
- Test: `packages/cli/src/__tests__/scaffold-meta-source.test.ts`

`scaffold-crud.ts` learns a domain's fields by regex-matching orval's emitted zod text (`X…Body = zod.object(`) and by reading `src/generated/model/<file>.ts`. Neither exists in a meta domain, and `.extend()` would not match the regex anyway — inherited fields would silently vanish from a generated form (spec §9.1).

- [ ] **Step 1: Write the IR source.** Fill the same contracts the scaffold already uses — `FieldInfo`, `FilterFieldInfo`, `EntityOperations` — from the IR instead of from text. Required-ness comes from `required`, filter operators from `searchable.operators` (no suffix guessing), labels from `labelKey`.

- [ ] **Step 2: Choose per domain.** If `generated-meta/` exists for the domain, use the IR source; otherwise the existing text-parsing source, unchanged.

- [ ] **Step 3: Template.** `user-index-ts.hbs` hard-codes `export * from "./generated/model"`. Make the path a variable so one template serves both. The UI templates need no change — they import from the package barrel by name, never from `generated/` (verified).

- [ ] **Step 4: Test** that scaffolding a meta domain produces the same `FieldInfo` set as the IR describes, including inherited fields; that a filter's operators come from the IR; that an orval domain still scaffolds identically to before.

- [ ] **Step 5: Run the full suite, then commit**

```bash
pnpm --filter @simplix-react/cli test && pnpm typecheck
git add packages/cli/src/meta/scaffold-source.ts packages/cli/src/commands/scaffold-crud.ts \
        packages/cli/src/templates/openapi/user-index-ts.hbs \
        packages/cli/src/__tests__/scaffold-meta-source.test.ts
git commit -m "feat(cli): let scaffolding read fields from the IR"
```

---

### Task 14: Move one domain end to end

- [ ] **Step 1** — in the smart-safety frontend's `simplix.config.ts`, add the `meta` block pointing at `openapi/meta.json` (the captured snapshot, already committed there) and leave `export` empty. Run codegen; both outputs exist.
- [ ] **Step 2** — `simplix meta-diff <domain>` for the smallest domain. Drive it to zero errors; record every info-level difference in the task report.
- [ ] **Step 3** — add that domain to `export`. Run `pnpm typecheck` and `pnpm build`.
- [ ] **Step 4** — run `simplix scaffold` for one entity in that domain and confirm the widget set is unchanged from what the orval path produced.
- [ ] **Step 5** — drive the screens in a browser under the `simplix:frontend-e2e` skill. A green typecheck is not evidence a screen works.
- [ ] **Step 6** — report: which domain, the info-level differences, what the browser pass found. **Do not delete `src/generated/` yet** — that is the last step after the domain has been exercised, and it is what makes the move irreversible.
