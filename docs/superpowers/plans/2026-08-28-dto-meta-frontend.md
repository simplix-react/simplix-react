# DTO Meta Codegen — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@simplix-react/cli` reads the backend's DTO metadata IR and generates TypeScript types, zod schemas, request functions, React Query hooks, MSW handlers, filter/permission configuration — in parallel with the existing orval output, so a domain can be moved across one at a time and moved back by reverting one config line.

**Architecture:** A new `packages/cli/src/meta/` reads the IR (from the dev endpoint or a committed snapshot), resolves it, and hands a shared shape to per-concern generators that write into `src/generated-meta/`. The existing orval path keeps behaving exactly as it does — four tasks add to `packages/cli/src/openapi/`, none change what it emits (see "Facts that bind every task"). A `meta-diff` command compares the two outputs so a domain is only switched once they agree.

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
| enums | 133 (122 labeled, 11 not — see Task 6) |
| enum values | 540, of which 498 carry a `labelKey`. **`labeled` and `labelKey` coincide exactly**: the 11 enums whose values lack a `labelKey` are the same 11 that are unlabeled, and no labeled enum is missing one. Generators may rely on that. |
| containers in use | `SimpliXApiResponse` 648 · `List` 356 · `Page` 93 · `Map` 74 |
| field kinds — **counting every `TypeRef` node**, container arguments included (6,501) | `string` 3110 · `number` 936 · `instant` 682 · `boolean` 593 · `enum` 541 · `container` 279 · `date` 202 · `ref` 134 · `time` 10 · `unknown` 8 · `param` 6 |
| field kinds — **one per field** (6,222) | `string` 2962 · `number` 935 · `instant` 682 · `boolean` 593 · `enum` 523 · `container` 278 · `date` 200 · `ref` 38 · `time` 10 · `param` 1 |
| constraints (709 on 550 fields) | `maxLength` 440 · `notBlank` 221 · `notEmpty` 11 · `pattern` 10 · `email` 7 · `min` 7 · `minLength` 5 · `max` 4 · `nonnegative` 2 · `positive` 1 · `maxItems` 1 · **`custom` 0** |
| access kinds | `permission` 566 · `authenticated` 94 · `public` 29 · `expression` 5 |
| `searchDto`-bearing operations | 86 |
| fields with `searchable` | 1118 |
| fields with `labelKey` | 2082 |
| distinct tags | 139 |

### What the fixture cannot test

Four declared shapes never occur in it, so a test written against the fixture proves nothing about
them. Implement each anyway — the IR declares them and a later capture will carry them — and build
the case by hand, saying in your report that the fixture does not cover it:

| Shape | In the fixture | Why |
| --- | ---: | --- |
| `{ kind: "file" }` | 0 | a `MultipartFile` parameter sets `contentType: "multipart"` and never becomes a `TypeRef`; the 2 multipart operations carry **no body at all** |
| `{ kind: "pick", of, fields }` | 0 | `@JsonIncludeProperties` sits only on entities, and no DTO field is typed by an entity (spec §12) |
| `ref` carrying `args` | 0 of 663 | there are no generic DTOs — every `typeParams` is empty |
| `{ kind: "binary" }` **as a field** | 0 | it occurs 5 times, all in responses (`…/download`, the avatar and content routes) |

`custom` constraints are a fifth such case — see Task 7.

Those numbers are the yardstick. A generator that silently drops a field kind will show up as a
count that does not match — **use the row that matches what you are counting**: a test walking
fields asserts against 6,222, one walking every `TypeRef` against 6,501. `unknown` and `param`
never appear at the top level of a field, only inside a container argument.

**Every number here was measured against the capture that predates Task 0.** Re-run them after the
re-capture; the request bodies change shape and the counts may move with them.

## Facts that bind every task

- **Repository:** `/Users/taehwan/Workspace/accesscore/simplix-react`, branch `feat/dto-meta-codegen`. Two files under `packages/ui/src/base/charts/` were dirty before this work began — they belong to somebody else; never stage them.
- **The orval path must keep working for every domain not yet moved.** That is the rule; "never
  open `packages/cli/src/openapi/`" is not, and four tasks legitimately reach into it — Task 4
  registers container types on `spec-profile.ts`, Task 8 exports the private path-grouping helpers
  from `entity-extractor.ts`, Task 9 completes `SUFFIX_TO_ENUM_KEY` in `scaffold-crud.ts`, and
  Task 13 makes the barrel templates' model path a variable.

  What each of those must satisfy: the change is **additive**, and the task proves the orval path
  is unchanged by running the full CLI suite and, where the change touches generation, by
  regenerating a domain and confirming the output is byte-identical. A change that alters what the
  orval path emits is out of scope no matter how much better it looks.
- Commit messages: English conventional commits, **no AI attribution of any kind**.
- **Run tests from the workspace root with `npx vitest run --project cli`.** Measured: the
  package script `pnpm --filter @simplix-react/cli test -- <name>` prints `No test files found`
  and **exits 0**, and `cd packages/cli && npx vitest run <path>` finds nothing either — the
  project's `root` is declared relative to the workspace, so invoking from the package directory
  resolves it wrongly. From the root it collects 67 files / 970 tests. Add `--reporter=verbose`
  and grep for your file when you need to prove yours ran.
- **Every CLI test lives in `packages/cli/src/__tests__/`, flat.** The root `vitest.config.ts`
  pins the CLI project to `include: ["src/__tests__/**/*.test.ts"]`, and the package script is
  `vitest run --passWithNoTests` — so a test placed anywhere else is never collected and the run
  still reports success. After adding a test, confirm the runner names your file and reports a
  non-zero test count; a green run that collected nothing looks identical to a passing one.
- **`--project cli` runs only `packages/cli`.** Three of these tasks put tests in the boot
  extension, where that flag collects nothing and still exits 0. Match the project to the package,
  from the workspace root:

  | Test lives in | Run |
  | --- | --- |
  | `packages/cli/src/__tests__/` | `npx vitest run --project cli` |
  | `extensions/simplix-boot/packages/utils/` | `npx vitest run --project @simplix-react-ext/simplix-boot-utils` |
  | `extensions/simplix-boot/packages/cli-plugin/` | `npx vitest run --project @simplix-react-ext/simplix-boot-cli-plugin` |
  | everything, before a task's final commit | `npx vitest run` |

  All three were verified to collect and pass. `npx vitest list` prints every collected test with
  its project in brackets — use it to confirm a new file is picked up.

- `pnpm` workspace. Typecheck: `pnpm typecheck`. Lint: `pnpm lint`.
- Comments and TSDoc in English (repo rule); the design spec is Korean and is not a template for code comments.

---

### Task 0: Re-capture the fixture — the committed one is stale

**Files:**
- Replace: `packages/cli/src/meta/__fixtures__/smart-safety-meta.json`
- Modify: `packages/cli/src/__tests__/meta-ir-types.test.ts` — assert the fixture matches the types

`RequestMeta.body` was a type name, and `DtoMetaBuilder` filled it with
`registry.register(resolvable.resolve())`. `resolve()` on `Set<OrganizationUpdateDTO>` yields the
raw `java.util.Set`, so the body arrived as the string `"Set"` and the element type — the entire
payload contract — was gone. **49 of the 231 body-carrying operations in the captured document
were affected**: every `PATCH /<resource>` multi-update (38, `Set<XUpdateDTO>`) and every
`PATCH /<resource>/order` reorder (11, `List<XOrderDTO>`).

A second defect of the same family was found beside it: a `MultipartFile` parameter set
`contentType: "multipart"` and was then discarded, so an upload operation named no part and
`{ kind: "file" }` — declared in spec §4 and §12 — was never produced at all. A client had nothing
to append the file under.

Both are fixed on `feat/dto-meta-endpoint` in the simplix repository, each with a regression test:
`02c49ac` maps the body the way the response was already mapped (pinning a `Set<T>` body to
`container("List", [ref T])`), and `a7c392b` records the part as a named `query` entry typed
`file`. `ir-types.ts` and spec §4 follow the first. **The committed fixture predates all of that**, so its 49 bodies are still
bare strings and every generator test written against it would encode the erased shape.

- [ ] **Step 1: Re-capture.** Run the smart-safety backend with the meta endpoint enabled and
  save `GET /dev/meta/dto` over the fixture. The backend fix must be on the classpath — build the
  starter from `feat/dto-meta-endpoint` first, or the capture reproduces the defect.

- [ ] **Step 2: Make staleness loud.** The existing test walks the fixture but never reads
  `body`, which is why nothing failed when the shape changed. Add:

```ts
it("every request body is a TypeRef, not a bare type name", () => {
  const bodies = meta.operations
    .map((o) => o.request.body)
    .filter((b): b is NonNullable<typeof b> => b !== undefined);
  expect(bodies.length).toBeGreaterThan(0);
  expect(bodies.filter((b) => typeof b !== "object" || !("kind" in b))).toEqual([]);
});
```

  Then assert a known multi-update: `PATCH /api/v1/admin/org`'s body is
  `{ kind: "container", name: "List", args: [{ kind: "ref", name: "OrganizationUpdateDTO" }] }`,
  and a known upload: `POST /api/v1/admin/user/account/{userId}/avatar` carries a `query` entry
  named `file` typed `{ kind: "file" }`. Both are absent from the old capture.
  A `Set` normalises to `List` because `TypeRefMapper` treats every `Collection` alike — which is
  also why Task 4's "four containers and no others" stays true after this change.

- [ ] **Step 3: Re-run every count this plan quotes.** The operation, type, enum, constraint and
  container figures below were measured against the old capture. Re-measure and correct any that
  moved; a plan quoting a number the fixture no longer contains sends an implementer looking for
  a defect that is not there.

- [ ] **Step 4: Commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/__fixtures__/smart-safety-meta.json \
        packages/cli/src/__tests__/meta-ir-types.test.ts
git commit -m "test(cli): re-capture the IR fixture with typed request bodies"
```

---

### Task 1: IR types, mirrored from the committed Java records

**Files:**
- Create: `packages/cli/src/meta/ir-types.ts`
- Test: `packages/cli/src/__tests__/meta-ir-types.test.ts`

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

`npx vitest run --project cli`
Expected: all green. A count mismatch means the fixture was regenerated against a different backend — stop and report rather than editing the numbers.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/meta/ir-types.ts packages/cli/src/__tests__/meta-ir-types.test.ts \
        packages/cli/src/meta/__fixtures__/smart-safety-meta.json
git commit -m "feat(cli): mirror the DTO meta IR as TypeScript types"
```

---

### Task 2: Fetch the IR from an endpoint or a snapshot

**Files:**
- Create: `packages/cli/src/meta/fetch.ts`
- Test: `packages/cli/src/__tests__/meta-fetch.test.ts`

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
- **Tag patterns are exact by default.** `createTagMatcher` treats a plain string as an exact
  match and only `/…/` as a regular expression, so `"site.*"` looks for a tag literally named
  `site.*` and matches nothing. Measured: all 130 patterns in the target application are exact
  strings and none uses a wildcard. If a domain resolves to zero operations, this is the first
  thing to check (spec §10).
- `unwrap` — **do not sniff the envelope's shape.** Spec §5.1 settles that an envelope is judged
  by name, not by field shape, because a shape test misreads a response whose body is empty. There
  is no TypeRef here, so use what each source guarantees instead:

  - **An HTTP source always carries an envelope.** `SimpliXMetaDevController.dto()` returns
    `SimpliXApiResponse<DtoMeta>` (fields `type`, `message`, `body`, `timestamp`, `errorCode`,
    `errorDetail`). Take `body` unconditionally, and throw naming the `type` and `message` when it
    is absent — that is an error envelope, not an IR.
  - **A snapshot file may be either**, since a person may have saved the whole response or just
    the document. Decide on the IR's own guaranteed member: `version` is an unboxed `int`, so
    `@JsonInclude(NON_NULL)` never drops it and a bare IR always has it at the top level. Present
    ⇒ the payload is the IR; absent ⇒ take `body`, and throw if that has no `version` either.
- `assertVersion` — refuse a `version` greater than `SUPPORTED_IR_VERSION` with a message telling the operator to upgrade the CLI. A newer document may carry members this CLI would silently drop (spec §5.1).

- [ ] **Step 2: Test it**

Cover: reading the real fixture from disk; an HTTP response unwrapping to `body`; an HTTP
response whose `body` is absent throwing with the envelope's `type` and `message`; a snapshot saved
as the whole response and one saved bare, both resolving to the same document; refusing
`version: 2`; a missing snapshot path producing an error that names the path; and a non-2xx HTTP
response surfacing the body text. Stub `fetch` rather than opening a socket.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/fetch.ts packages/cli/src/__tests__/meta-fetch.test.ts
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

- [ ] **Step 2: Test** that `resolveBootEnum` accepts a `LabeledEnumValue` and returns its `value`, and that a plain string still round-trips.

- [ ] **Step 3: Run this package's project, then commit**

```bash
npx vitest run --project @simplix-react-ext/simplix-boot-utils
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
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};
```

**`keyType` is not decoration.** The IR's `Map` container carries **one** argument — the value —
because `TypeRefMapper` maps `resolvable.getGeneric(1)` and drops the key. TypeScript needs
`Record<string, V>` and zod v4 needs `z.record(z.string(), V)`; see Task 7 for what happens
without it.

`SpringPage`, `pageOf` and `springPageSchema` already exist in `@simplix-react-ext/simplix-boot-auth` — do not redefine them.

- [ ] **Step 2: Extend `SpecProfile`** with **four** optional members, so existing profiles are
  unaffected: `metaEndpoint?: string`, `metaDownloader?`,
  `containerTypes?: Record<string, ContainerMapping>`, and
  `metaExtensions?: (meta: DtoMeta) => MetaExtensionOutput | undefined`.

  `metaExtensions` is the frontend half of the backend's `SimpliXMetaContributor` SPI (spec §6) —
  a contributor puts arbitrary data into the IR's `extensions`, and this turns it into files:

  ```ts
  interface MetaExtensionOutput {
    /** Path relative to `generated-meta/` → file content. */
    files: Record<string, string>;
  }
  ```

  Register the boot values in the plugin's `registerPlugin` call, endpoint
  `/api/v1/dev/meta/dto`. **Do not register a `metaExtensions` implementation** — the boot profile
  has no contributor, and the captured IR's `extensions` is absent. The point of this step is that
  the seam exists and is typed; inventing a default behaviour for it would be the speculative
  code this project's rules forbid.

- [ ] **Step 3: Test** that every container name appearing in the real fixture has a mapping — this is the assertion that catches a backend adding a container the plugin does not know:

```ts
const used = new Set<string>();
// walk the fixture as in Task 1's test
expect([...used].filter((n) => !(n in bootContainerTypes))).toEqual([]);
```

- [ ] **Step 4: Run both projects this task touches, then commit**

```bash
npx vitest run --project @simplix-react-ext/simplix-boot-cli-plugin
npx vitest run --project cli
pnpm typecheck
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
- Test: `packages/cli/src/__tests__/meta-resolve.test.ts`

The generators need the IR sliced by domain and indexed. This task does that once so no generator re-walks the document.

- [ ] **Step 1: Write it.** `resolveMeta(meta, { domains, containerTypes })` returns, per domain name:
  - the operations whose `tag` matches that domain's tag patterns. **Reuse
    `createTagMatcher` from `packages/cli/src/openapi/pipeline/domain-splitter.ts`** — it is
    exported and already implements the exact-string / `/regex/` rule. Re-implementing it is how
    the two paths drift into disagreeing about which domain owns a tag.
  - the transitive closure of types those operations reach, by walking `request.body`, `request.searchDto`, `response`, and each type's `extends` and `ref`/`pick` fields
  - the enums reached the same way
  - for each type, its full field list including inherited ones, computed by following `extends` — **kept separate from the own-field list**, because the generated `interface X extends Y` must emit only own fields while a zod schema built with `.extend()` needs to know the parent

  Report an operation whose `tag` matches no domain rather than dropping it silently.

  **Expect 117 unmatched out of 694** against the smart-safety config, across 24 tags. The
  matched side is 577 and splits exactly as Task 14's table says. The unmatched side, counted:

  | Group | n | Tags |
  | --- | ---: | --- |
  | `data-io.*` — screens not built yet | 44 | `ImportRun` 16, `ExportLedger` 10, `DuplicateMerge` 4, `BulkOperation` 3, `ImportJob` 3, `DuplicateCandidate` 2, `BulkReversal` 2, `ExportCensus` · `DuplicateCensus` · `BulkCensus` · `ImportCensus` 1 each |
  | `dev.test.*` — the app's own test controllers | 30 | `UserPermission` 11, `Error` 10, `Response` 9 |
  | framework-owned, tagged by class name | 30 | `StreamAdminController` 16, `CurrentUserRestController` 8, `SseStreamController` 6 |
  | **auth surfaces the `auth` domain does not claim** | 9 | `Auth Token` 3, `OAuth2 Social Login` 3, `PasswordWebController` 2, `SimpliXAuthLoginController` 1 |
  | other | 4 | `ScalarController` 2, `public.file.Content` 1, `dev.backoffice` 1 |

  The first three groups are expected. **The fourth is worth raising rather than accepting** — the
  `auth` domain's seven patterns are all `common.auth.*` / `public.auth.SignInOption`, so sign-in,
  token and password endpoints fall outside it. Report it; whether they should join `auth` is the
  user's call, not the generator's.

  A run that reports far fewer than 117 means a tag pattern started matching something it should
  not.

- [ ] **Step 1b: Assign each type one owner, and keep the closure clean.**

  **Spec §5.1 requires that a type is never declared twice**, and the layout is one file per
  entity, so a type reachable from two entities in the same domain would be written into both and
  collide at `export *`. Measured: **33 of the 637 types are reachable from more than one tag** —
  `SimpliXBaseEntity` and `BaseEntity` from 7 each, `JobPosition` 4, `UserAccount` and
  `Organization` 3. Resolve must therefore return, per domain, a **type → owning entity** map, and
  every generator writes a type only into its owner's file. Put a shared type in the entity that
  reaches it first in a deterministic order, so two runs agree.

  **Fourteen of the 104 inheritance edges cross a domain boundary, and the parent must be
  duplicated.** `AreaZoneUpdateFormDTO` (`site`) extends `AreaUpdateFormDTO` → `AreaUpdateDTO` →
  `AreaCreateDTO`, all three of which belong to `space`. Measured, all three already land in both
  domains' closures.

  There is no import path available: **no domain package depends on another** — checked across all
  13, and `domain-site`'s dependencies are the framework packages only. Adding one would make the
  domain graph a graph rather than a fan, which is a change the user has not asked for. So pull the
  parent in and declare it in both packages, and say in your report which types this affected.

  **Note what this costs and why it is still right.** Orval avoids the duplication by flattening
  inheritance — `AreaZoneUpdateFormDTO` in `domain-site` carries the parent's fields copied inline
  and never names `AreaUpdateFormDTO`. That flattening is the first defect §1 lists. Preserving the
  chain is the point of this project; two structurally identical declarations in two packages is
  the price, and TypeScript's structural typing means a value crosses between them freely.

  **The closure also picks up types that are not DTOs.** The fixture holds 12 whose `javaClass` is
  JDK or Spring — reached because the walker's fallback is "anything else is a DTO":

  | Type | Reaches a real domain | Note |
  | --- | --- | --- |
  | `Set`, `List` (0 fields) | 9 domains | artefacts of the erased request body; **Task 0's backend fix removes them** |
  | `Comparable` (0 fields) | `user` | real and remains — `Organization.sortKey` is typed `Comparable<?>` |
  | `ApplicationContext`, `AutowireCapableBeanFactory`, `ApplicationObjectSupport`, `WebApplicationObjectSupport`, `AbstractView`, `AbstractUrlBasedView`, `RedirectView`, `SseEmitter`, `ResponseBodyEmitter` | **none** | reachable only from unmatched tags, via `RedirectView` → `AbstractView` → `ApplicationObjectSupport` → `ApplicationContext` |

  So assert that no domain closure contains a type whose `javaClass` starts with `java.`,
  `javax.`, `jakarta.` or `org.springframework.` — with `Comparable` as the one accepted exception,
  reported rather than silently emitted. A new one appearing means a controller started returning a
  framework type and the walker followed it.

- [ ] **Step 2: Test against the real fixture.** Assert that resolving with a single catch-all domain reaches all 637 types; that a domain's closure never contains a type none of its operations reach; that `extends` chains resolve (the fixture has 104); and that a type whose parent is outside the domain still pulls the parent in.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/resolve.ts packages/cli/src/__tests__/meta-resolve.test.ts
git commit -m "feat(cli): resolve the IR into per-domain type closures"
```

---

### Task 6: Model generator — interfaces, enums, envelope-free

**Files:**
- Create: `packages/cli/src/meta/generation/model-gen.ts`
- Test: `packages/cli/src/__tests__/meta-model-gen.test.ts`

- [ ] **Step 1: Write it.** For one domain, emit:
  - `model/<entity>.ts` — one `export interface` per type, `extends` where the IR says so, **own
    fields only**. A type reachable from two entities is written into its **owner's** file alone
    (Task 5) — spec §5.1 forbids declaring the same type twice, and `export *` from the directory
    barrel would collide on the 33 shared types
  - `model/_enums.ts` — the exact declaration-merge shape orval emits, so a module that imports
    the name as a **value** keeps working.

    **Eleven of the fixture's 133 enums are not labeled** — `SessionState`, `InboxTab`,
    `LawScreenMapNarrowing`, `UserAccountStanding`, `DayOfWeek`, `TransportType`,
    `AdminCommandType`, `AdminCommandStatus`, `SchedulerState`, `MessageButtonGrade`,
    `MfaUnavailableReason` — and 14 DTO fields use them, `UserAccountDetailDTO.standing`,
    `UserAccountListDTO.standing` and `SiteDetailDTO.weekStartDay` among them. Those arrive as
    bare strings. Emit the `…Labeled` alias **only when `labeled` is true**; emitting it for all
    133 puts a `{value,label}` type on 14 fields that carry a string, which is precisely the
    silent falsehood this project exists to remove.

    Verified against `generated/model/siteOnboardingStepKey.ts`:

    ```ts
    import type { LabeledEnumValue } from "@simplix-react-ext/simplix-boot-utils";

    export type AreaKind = (typeof AreaKind)[keyof typeof AreaKind];
    export const AreaKind = { AREA: "AREA", ZONE: "ZONE" } as const;

    /** Only for a labeled enum: the shape a response field actually carries. */
    export type AreaKindLabeled = LabeledEnumValue<AreaKind>;
    ```

    The type and the const share one name — that is what makes `SiteOnboardingStepKey` usable in
    both positions. Emitting `export type X = "A" | "B"` beside the const instead loses nothing
    structurally but stops matching what orval produced, and Task 11 swaps barrels on the
    assumption that the two are interchangeable.
  - no envelope type — `SimpliXApiResponse` is `unwrap: true`, so it does not appear in client types

  Field typing rules, from the measured kinds: `string`→`string`; `number`→`number`; `boolean`→`boolean`; `instant`/`date`→`string`; `time`→`string`; `enum`→ **gated on `EnumMeta.labeled`**: when true, the value union in a request DTO and the `…Labeled` alias in a response DTO (spec §9); when false, the value union in **both** directions and no `…Labeled` alias at all; `ref`→ the interface name; `container`→ the plugin's mapping; `unknown`→`unknown`; `pick`→ `Pick<Of, "a" | "b">`; `param`→ **see below, it is not simply the
  type parameter**.

  `unknown` needs no special handling and was verified: all 8 field-level occurrences are the value
  of a `Map<String, Object>` (`SchedulerInfo.params`, `Organization.eventPayloadData`, …), giving
  `Record<string, unknown>` and `z.record(z.string(), z.unknown())`. The 27 further occurrences are
  operation responses, and **none of them reaches a domain** — every one is in an unmatched tag
  (`dev.test.*`, `dev.permissions`, `Auth Token`, the stream admin routes).

  **A `param` whose name is not among the owning type's `typeParams` is unresolvable — emit
  `unknown` and report it.** Measured, all six occurrences are of that kind:

  | Where | Cause |
  | --- | --- |
  | `ObligationApplicabilitySearchDTO.appliedRules` · `.excludedRules`, `PreAssignmentGateSearchDTO.notifyRoleCodes`, `RegulationDutySearchDTO.additionalArticleRefs`, `PolicyParameterSearchDTO.usedByScreenKeys` | the Java field is a **raw** `private List appliedRules;` with no type argument, so the container's argument resolves to the collection's own variable `E` |
  | `SimpliXBaseEntity.id` | the entity base class's generic key `K` |

  Emitting `appliedRules?: E[]` puts an unbound identifier in the output, and Task 11 Step 4b's
  no-`@ts-nocheck` rule leaves nowhere to hide it. `unknown[]` compiles and is honest. **Report the
  five by name** — they are five raw declarations in one backend module (`regulation`), the IR is
  reporting them correctly, and fixing them there is what makes the generated type useful. Do not
  fix them yourself; that is a backend change outside this plan.

  A field is optional (`?`) exactly when `required` is false.

  **Ignore `nullable` — it carries no information.** Measured over all 6,222 fields, the only two
  combinations that occur are `(required: true, nullable: false)` 615 and
  `(required: false, nullable: true)` 5,607. There is no `(true, true)` and no `(false, false)`, so
  `nullable === !required` everywhere. Emitting `| null` alongside `?` would give
  `field?: string | null` where orval gave `field?: string`, and `meta-diff` would report a field
  type mismatch on 5,607 fields.

- [ ] **Step 2: Test against the real fixture.** Generate for a domain and assert: an `extends` type emits only its own fields; a **labeled** response enum field is the `Labeled` alias while the same enum in a request DTO is the union; an **unlabeled** enum is the plain union in the response too — assert `UserAccountDetailDTO.standing` by name and that no `UserAccountStandingLabeled` is emitted anywhere; no `SimpliXApiResponse` appears anywhere in the output; **no exported name appears in two files
of one domain** — walk the emitted `model/` directory and assert the set of exported interface
names has no duplicate, which is the only thing that catches a shared type written twice; every one of the 11 field kinds present in the fixture produces valid TypeScript. **Prove the output is well-formed TypeScript, not merely that it contains the right substrings.**

  Use `ts.transpileModule(text, { reportDiagnostics: true })` and assert `diagnostics` is empty.
  That is a **syntax** check and it is the right one here: it catches a malformed emit — an
  unbalanced brace, a stray comma, a broken generic — without needing module resolution.

  **Do not reach for `ts.createProgram`.** The generated model imports `LabeledEnumValue` from a
  workspace package, so a standalone program reports `cannot find module` diagnostics that are
  artefacts of the harness rather than defects in the output, and the assertion then has to be
  weakened until it proves nothing. Full type resolution against the workspace happens for real
  after Task 11 wires the output into a domain package, where `pnpm typecheck` does it properly.

  There is no precedent for the compiler API in `packages/cli`, so import it as
  `import ts from "typescript";` (available via the workspace catalog) and keep the usage to that
  one call.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/generation/model-gen.ts packages/cli/src/__tests__/meta-model-gen.test.ts
git commit -m "feat(cli): generate TypeScript models from the IR"
```

---

### Task 7: Schema generator — zod with inheritance and constraints

**Files:**
- Create: `packages/cli/src/meta/generation/schema-gen.ts`
- Test: `packages/cli/src/__tests__/meta-schema-gen.test.ts`

This is where the project's original complaint is answered: 440 `maxLength` and 221 `notBlank` constraints reach the client.

- [ ] **Step 1: Write it — one const per TYPE, and orval's names cannot be reproduced.**

  **Measured:** orval names zod constants **per operation and role**, not per type —
  `OrganizationRestCreateBody`, `OrganizationRestGetResponse`, `OrganizationRestUpdateParams`,
  `OrganizationRestUpdateTreeOrderQueryParams`, and for a collection body the pair
  `OrganizationRestMultiUpdateBodyItem` + `OrganizationRestMultiUpdateBody = zod.array(…Item)`.
  One entity's 12 operations produce 32 constants. The IR's `types` map is keyed by DTO simple
  name, so "one const per type, named as orval named it" is not a thing that can be built.

  **The decision, and what makes it safe:** emit one const per type, named `<TypeName>Schema`
  (`OrganizationCreateDTOSchema`). A schema belongs to a DTO, not to an operation, and the same
  DTO is a body on one route and a response on another. This departs from orval's names, and
  **nothing in the application imports them** — grepped across the whole frontend outside
  `generated/`: **0 references**, and no module imports `schemas.ts` at all. The constants exist
  only in the barrel. Task 12 therefore classifies a zod-constant name difference as **info**;
  see there.

  `schemas.ts` re-exports with `export *`, so it keeps resolving whatever names exist.

  A type with `extends` is built as `parentSchema.extend({ …own fields… })`.

  **Emit in dependency order — a zod const cannot reference one declared later.** Unlike an
  `interface`, `parentSchema.extend(…)` evaluates at module load. The fixture has chains four deep:
  `AreaZoneUpdateFormDTO → AreaUpdateFormDTO → AreaUpdateDTO → AreaCreateDTO`, and 51 types are two
  deep, 2 are three, 1 is four. Topologically sort the domain's types by `extends` before writing,
  and **order the files as well as the declarations inside them** — with one file per entity the
  parent frequently lands in a different file, and `schema/index.ts` re-exporting in the wrong
  order gives `undefined` at evaluation, not a type error.

  Every parent is present: 0 of the 104 name a type absent from `types`.

  One child re-declares a parent field — `Organization.eventPayloadData` over
  `BaseEntity.eventPayloadData` — and the two are **identical** in type and required-ness, so
  `interface Organization extends BaseEntity` with that member repeated is legal. No de-duplication
  is needed; if a future capture has them differing, that is a TypeScript error worth reporting
  rather than silently dropping one.

**Target zod v4** — the workspace resolves `zod@4.3.6` and orval's existing output already uses
  the v4 surface (`zod.iso.datetime()`, `zod.iso.date()`, `zod.int()`). Two consequences the
  first draft of this plan got wrong:

  - `z.string().email()` is **deprecated in v4** (`@deprecated Use z.email() instead` in
    `zod/v4/classic/schemas.d.cts:110`). Emit the top-level `z.email()`.
  - The base type of a temporal field is **not** a bare `z.string()`. Orval emits
    `zod.iso.datetime()` for an instant and `zod.iso.date()` for a date; emitting a plain string
    would drop format validation the orval path already had — a regression, and one `meta-diff`
    would report as a field-type mismatch.

  **Base type by `TypeRef.kind`:** `string`→`z.string()`; `number`→`z.number()`, and
  `z.int()` when `integral` is true; `boolean`→`z.boolean()`; `instant`→`z.iso.datetime()`;
  `date`→`z.iso.date()`; `time`→`z.string().regex(...)` built from the IR's `pattern` when
  present, else the `HH:mm` shape (spec §12); `enum`→ **gated on
  `EnumMeta.labeled`**: `z.enum([...])` for a request field, and for a response field the labeled
  object shape only when `labeled` is true — otherwise `z.enum([...])` there too (spec §12); `ref`→ the referenced schema constant;
  `container`→ the plugin's `zod` factory (`pageOf` for `Page`, `z.array` for `List`,
  `z.record` for `Map`, and nothing for the unwrapped envelope); `unknown`→`z.unknown()`.

  **`z.record` takes two arguments in zod v4 and the IR supplies only one.** The `Map` container
  carries the value type alone, so emit `z.record(z.string(), <value>)` using the mapping's
  `keyType`. Measured on the installed `zod@4.3.6`: the one-argument form does not fail to
  validate, it **throws while the schema is being constructed** —
  `Cannot read properties of undefined (reading '_zod')` — so every domain holding one of the
  fixture's 74 `Map` fields would crash on import rather than produce a bad type.

  **Constraint mapping** (spec §5), applied on top of the base type: `notBlank`→`.trim().min(1)`;
  `notEmpty`→`.min(1)`; `minLength`/`maxLength`→`.min()`/`.max()`; `minItems`/`maxItems`→
  `.min()`/`.max()` on the array; `min`/`max`→`.min()`/`.max()` — **coercing the value, because
  `@DecimalMin` sends a JSON string while `@Min` sends a number** (spec §5);
  `positive`/`nonnegative`/`negative`/`nonpositive`→ the matching zod call;
  `pattern`→`.regex(new RegExp(...))`; `email`→ `z.email()` as the base type rather than a
  method on a string; `assertTrue`/`assertFalse`→`z.literal(true)`/`z.literal(false)`;
  `custom`→ **no zod call**, emit a comment naming it as a server-only check. The captured IR
  contains none (spec §12), so this branch is reached only by a future field-level custom
  constraint — implement it, and do not assume the fixture proves it works.

  A non-required field gets `.optional()`.

  **A self-referential type needs `z.lazy()` (spec §5.1).** An `interface` may reference itself,
  but a zod const is bound by declaration order — `const X = z.object({ parent: X })` reads `X`
  before it exists. Measured, the fixture holds **five self-referential types and no mutual
  cycles**: `OrganizationListDTO`, `LawScreenMapNodeDTO`, `AreaNodeDTO`, `Organization`, and
  `ApplicationContext` (which no domain closure reaches — see Task 5).

  **`OrganizationListDTO` is in `org`, the pilot domain**, so Task 14 meets this on the first
  domain moved. Detect the cycle while resolving rather than at emit time, and wrap only the
  self-referencing member:

  ```ts
  const OrganizationListDTO: z.ZodType<OrganizationListDTOType> = z.object({
    orgId: z.string(),
    children: z.array(z.lazy(() => OrganizationListDTO)).optional(),
  });
  ```

  The explicit type annotation is required — TypeScript cannot infer a recursive schema's type and
  reports `implicitly has type 'any' because it does not have a type annotation`, which Task 11's
  no-`@ts-nocheck` rule leaves nowhere to hide.

  **The kind vocabulary is closed and matches the backend exactly.** `ConstraintExtractor.extract`
  emits only: `notBlank`, `notEmpty`, `minLength`, `maxLength`, `minItems`, `maxItems`, `min`,
  `max`, `positive`, `nonnegative`, `negative`, `nonpositive`, `pattern`, `email`, `assertTrue`,
  `assertFalse`, `custom` — the list above. `@NotNull` produces no entry; it feeds `required`.
  Handle every kind and throw on an unrecognised one rather than skipping it.

  **Eleven of the seventeen appear in the fixture**, and these are the ones the tests can reach:

  | kind | n | note |
  | --- | ---: | --- |
  | `maxLength` | 440 | |
  | `notBlank` | 221 | **140 of them pair with a length bound** |
  | `notEmpty` | 11 | always on a `List`, never a string — `.min(1)` on the array |
  | `pattern` | 10 | |
  | `email` | 7 | **5 also carry `maxLength`, 4 also `notBlank`** |
  | `min` | 7 | |
  | `minLength` | 5 | |
  | `max` | 4 | |
  | `nonnegative` | 2 | on an integral number |
  | `positive` | 1 | |
  | `maxItems` | 1 | on a `List`, so `.max()` on the array |

  Both collection bounds in the fixture land on `List`, never on `Map` — a `Map` field carrying
  `@Size` would produce `minItems`/`maxItems` over a `z.record`, which has no such method. Throw
  there rather than emitting a call that does not exist.

  **These chains were run against the installed `zod@4.3.6` and behave as prescribed:**
  `z.email().trim().min(1).max(N)` enforces the length; `z.string().min(1).min(10)` — what a
  `notBlank` + `minLength` field produces — rejects a 5-character string, so the redundant
  `.min(1)` is harmless and needs no deduplication; `z.int().nonnegative()` rejects `-1`;
  `z.iso.datetime()` rejects `"not a date"`; `z.iso.date()` rejects a full timestamp.

  **Check the installed zod before emitting any call you have not seen in orval's output.** The
  v4 surface deprecated several v3 methods; read
  `node_modules/.pnpm/zod@4*/node_modules/zod/v4/classic/schemas.d.cts` rather than writing from
  memory of v3.

- [ ] **Step 2: Test against the real fixture.** Build the emitted schemas and exercise them at
  runtime rather than asserting on generated text — the point is that they validate, not that
  they contain a substring. Assert:

  - a `notBlank` field rejects `""` — **the exact defect the project exists to fix**, so prove it
  - a `maxLength` field rejects an over-long string (the fixture has 440 of these)
  - a `@DecimalMin`-sourced **string** bound produces a working numeric `.min()`. The fixture has
    exactly two such fields — `FloorPlanPlacementUpdateDTO.horizontalRatio` and `.verticalRatio`,
    both carrying `{"kind":"min","value":"0.0"}` and `{"kind":"max","value":"100.0"}` on a
    non-integral number. Assert the emitted schema rejects `101`; a generator that passed the
    string straight to `.min()` would build a schema that never rejects anything.
  - an `instant` field accepts an ISO timestamp and rejects `"not a date"` — this is the
    orval-parity check; a plain `z.string()` would pass both and the test would catch it
  - a `date` field accepts `2026-08-28` and rejects a full timestamp
  - **`custom` cannot be exercised against this fixture** — it holds 709 constraints and zero
    `custom`, because the only custom validators in the application (`@UniqueFields` 3,
    `@ValidateWith` 1) sit on the DTO *class* and `ConstraintExtractor` reads properties.
    Test the branch with a hand-built `FieldMeta`, and say in your report that the fixture does
    not cover it
  - a `Map` field's schema is `z.record(z.string(), …)` and **constructs without throwing** — build
    it, do not merely grep the text; the one-argument form throws at construction, which a
    substring assertion would never notice
  - an `extends` type's schema validates a field declared on the parent
  - **`OrganizationListDTO` builds and validates a two-level nested value** — the recursive case,
    from the pilot domain. A schema that referenced itself directly would throw or be `undefined`
    at construction, so build it and parse, do not grep for `z.lazy`
  - no emitted call is one v4 deprecates — grep the generated text for `.email(`, `.url(`,
    `.uuid(` used as methods and assert none appear

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/generation/schema-gen.ts packages/cli/src/__tests__/meta-schema-gen.test.ts
git commit -m "feat(cli): generate zod schemas carrying the server's constraints"
```

---

### Task 8: Endpoint and hook generators

**Files:**
- Create: `packages/cli/src/meta/generation/endpoint-gen.ts`
- Modify: `packages/cli/src/openapi/pipeline/entity-extractor.ts` — export the path-grouping helpers
- Create: `packages/cli/src/meta/generation/hook-gen.ts`
- Test: `packages/cli/src/__tests__/meta-endpoint-hook-gen.test.ts`

**Output:** `generated-meta/endpoints/<entity>.ts` (request functions and URL builders) and
`generated-meta/hooks/<entity>.ts` (the React Query hooks), one file each per entity, plus the two
directory barrels Task 11 Step 2 requires. Orval put both halves in one per-tag file; this layout
splits them per entity (spec §9), which is why Task 11's stub layer is regenerated rather than
repointed.

- [ ] **Step 1: Write them.** Request functions go through the domain package's own
  `src/mutator.ts`, which is the same file the orval path uses, so the envelope is unwrapped in one
  place and `data` has the same shape on both paths (spec §8).

  **The measured contract** — `src/mutator.ts` exports
  `customFetch<T>(url: string, options: RequestInit): Promise<T>`, which delegates to
  `getMutator("boot")`. Call `customFetch`, not `getMutator` directly. Match orval's emitted shape:

  ```ts
  export const getLinearAsset = async (
    linearAssetId: string,
    options?: Parameters<typeof customFetch>[1],
  ): Promise<GetLinearAssetResponse> =>
    customFetch<GetLinearAssetResponse>(getGetLinearAssetUrl(linearAssetId), {
      ...options,
      method: "GET",
    });
  ```

  A body-carrying call adds `headers: { "Content-Type": "application/json", ...options?.headers }`
  and `body: JSON.stringify(dto)`. **The body parameter's type comes from `request.body`, which is
  a `TypeRef`** — 49 of the fixture's 231 bodies are containers, so a multi-update takes
  `OrganizationUpdateDTO[]` and not a single DTO. Map it through the same container rules the
  response uses; treating `request.body` as a type name is the defect Task 0 exists to remove.

  **A list hook has a second contract, enforced by nobody at compile time.** `adaptOrvalList`
  (`packages/headless/src/adapt-orval-list.ts:63`) is what every generated list screen wraps its
  hook in, and it does exactly this:

  ```ts
  const query = useApiHook(apiParams, { query: queryOpts });
  const page = query.data as any;
  return { data: page?.content, total: page?.totalElements, isLoading: query.isLoading, ... };
  ```

  So a list hook must take **two positional arguments** — params, then an options object with a
  `query` member — and its `data` must be the Spring page itself, carrying `content` and
  `totalElements`, because the mutator has already stripped the envelope. `OrvalListHookLike`
  types both parameters as `any`, so a hook with a different arity or a `data` shaped otherwise
  **compiles cleanly and renders an empty list with no error** — `page?.content` is simply
  `undefined`. Task 14's browser pass is the only thing that would catch it.

  **Emit a `get<Name>QueryKey` function per query operation — it is a public export module code
  imports.** Measured: `modules/notification/src/widgets/notice/detail.tsx:172` writes
  `queryKey: [...getGetNoticeQueryKey(noticeId), language]`, so both the name and the returned
  shape are part of the contract, and `modules/system/src/widgets/notice/notice-dismissals.tsx`
  imports another. Add them to Task 12's parity list. A URL builder (`getGetLinearAssetUrl`) is emitted alongside,
  because the hook's query key uses it — see below.

  Hooks use the profile's naming strategy (`simplixBootNaming`) so the exported names match what
  orval produced. **This is not cosmetic** — the migration switches a barrel, module code imports
  hooks by name (spec §11), and `crud.config.ts` drives the scaffold off those same names.

  **The measured contract, from `domain-org`.** `crud.config.ts` stores each role's hook name
  **without the `use` prefix**, and the generated export is `use` + that value:

  | `crud.config.ts` | generated export | form |
  | --- | --- | --- |
  | `list: "listOrganizations"` | `useListOrganizations` | `export function` (query) |
  | `get: "getOrganization"` | `useGetOrganization` | `export function` |
  | `getForEdit: "getOrganizationForEdit"` | `useGetOrganizationForEdit` | `export function` |
  | `tree: "getOrganizationTree"` | `useGetOrganizationTree` | `export function` |
  | `subtree: "getOrganizationSubtree"` | `useGetOrganizationSubtree` | `export function` |
  | `create: "createOrganization"` | `useCreateOrganization` | `export const` (mutation) |
  | `update: "updateOrganization"` | `useUpdateOrganization` | `export const` |
  | `delete: "deleteOrganization"` | `useDeleteOrganization` | `export const` |
  | `batchUpdate: "batchUpdateOrganizations"` | `useBatchUpdateOrganizations` | `export const` |
  | `batchDelete: "batchDeleteOrganizations"` | `useBatchDeleteOrganizations` | `export const` |
  | `order: "orderOrganization"` | `useOrderOrganization` | `export const` |
  | `org: "orgOrganization"` | `useOrgOrganization` | `export const` |

  All twelve correspond exactly. Queries are emitted as `export function` (orval overloads them),
  mutations as `export const`. Match both the names and the declaration forms — `findCrudConfigForEntity`
  resolves a role to a name and the scaffold then imports it, so a renamed hook breaks scaffolding
  in a way `pnpm typecheck` on the domain package alone will not catch.

  **`entityName` is the hard member, and Tasks 9 and 10 depend on the same answer.** The strategy
  takes an `OperationContext` whose `entityName` comes from `resolveEntityName(EntityNameContext)`,
  and the grouping that decides which operations share one entity is **path-based, not tag-based**:
  `extractEntities` (`entity-extractor.ts:29`) loops over tags, and inside each tag
  `splitIntoEntities` groups by base path (`/pet/{petId}` and `/pet/findByStatus` both reduce to
  `/pet`) and then merges related paths. That is why one domain package emits six mock factories
  under far fewer tags.

  **Every input that grouping needs is in the IR** — `method`, `path`, `tag` — but **none of the
  code is reachable.** `splitIntoEntities`, `buildEntityNameContext`, `extractBasePath`,
  `mergeRelatedPaths` and `extractResourceName` are all private to `entity-extractor.ts`, and the
  one exported entry point takes an `OpenAPISpec`, which the meta path does not have.

  Export the path-grouping helpers and call them. Do not reproduce the logic: a meta domain that
  groups routes even slightly differently from its orval twin emits different factory names and
  different hook names, and Task 11's barrel swap then stops being a swap.

  `EntityNameContext` maps from the IR field by field:

  | Member | From the IR |
  | --- | --- |
  | `tag` | `operation.tag` |
  | `paths` | deduplicated `operation.path` in the group |
  | `operations[].operationId / method / path / summary` | the same members |
  | `operations[].queryParams` | `request.query[].name` |
  | `schemaNames` | the type names in `request.body`, `request.searchDto` and `response` |
  | `extensions` | **not in the IR** — it reads `x-*` off the OpenAPI tag object. Pass `{}` and say so in your report; if a naming strategy ever depends on it, that is a backend IR change, not something to invent here. |

  Build the rest of the `OperationContext` (`operationId`, `method`, `path`, `tag`, `summary`)
  from the IR operation directly. Names come from route and verb in almost every
  case; `operationId` is only the last-resort fallback (`naming.ts:340`), which is why the IR's
  `id` must equal the OpenAPI `operationId` — the backend derives it with the same
  controller-name strip order as `OperationIdCustomizer`, so `EquipmentInspectionRestController`
  yields `EquipmentInspectionRest_override` on both sides. If you find an id that does not match
  the OpenAPI document, report it rather than papering over it in the naming call.

  **Query keys — measured, and NOT built from the URL builder.** Orval emits a separate key
  function whose first element is the **bare path with no query string**, with the params object
  appended only when present:

  ```ts
  export const getGetOrganizationQueryKey = (orgId: string) =>
    [`/api/v1/admin/org/${orgId}`] as const;

  export const getListOrganizationsQueryKey = (params?: ListOrganizationsParams) =>
    [`/api/v1/admin/org/search`, ...(params ? [params] : [])] as const;
  ```

  `getListOrganizationsUrl` builds a `URLSearchParams` and returns path **plus** query string —
  that is the fetch URL, not the key. Using it for the key would put `?page=0&size=10` into
  `queryKey[0]`, making every parameter combination a different cache entry and rendering
  `queryKey[1]` meaningless.

  This matters more than any other shape in the plan: `useInvalidateEntity`
  (`packages/ui/src/crud/form/use-invalidate-entity.ts:18`) invalidates with
  `typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith(apiPrefix)`, and the
  application calls it in **137 places**. A different key shape breaks cache invalidation across
  the whole product with no error anywhere (spec §5.1).

- [ ] **Step 2: Test against the real fixture.** Assert:

  - **the entity grouping**, first and by name — `org.Organization`'s 12 operations must land in
    the entity set `splitIntoEntities` produces, and the hook file names must follow. Tasks 9, 10
    and 13 all inherit this partition, so it is the one thing here that must not be left to a
    downstream test.
  - a generated hook's name equals what `simplixBootNaming` yields for the same operation
  - `getGetOrganizationQueryKey("x")` returns exactly `["/api/v1/admin/org/x"]`, and
    `getListOrganizationsQueryKey({page:0})` returns `["/api/v1/admin/org/search", {page:0}]` —
    **no query string in element 0**, and no params element when params are absent
  - a `Void` response produces a hook with no data type — 3 operations in the fixture have no
    `response` key at all
  - **a list hook survives `adaptOrvalList`**: call the generated `useListOrganizations` through it
    with a stubbed query client returning a Spring page, and assert `data` and `total` come back
    populated. Asserting on the emitted text cannot catch an arity mismatch here, because
    `OrvalListHookLike` types both parameters as `any`
  - a **`binary` response** produces a function returning `Blob` rather than a hook. Three of the
    five reach a real domain: `/api/v1/system/exports/{exportJobId}/download` (`system`) and the
    two `public.user.Avatar` routes (`user`); the other two are in unmatched tags
  - a **multipart operation** sends `FormData` **with the part appended under its IR name**. The
    fixture's `POST /api/v1/admin/user/account/{userId}/avatar` (`user`) carries no body — the file
    arrives as a `query` entry named `file` typed `{ kind: "file" }`, which is what Task 0's second
    backend fix put there. A generator that only reads `contentType` knows to send FormData but not
    what to call the part.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/generation/endpoint-gen.ts \
        packages/cli/src/meta/generation/hook-gen.ts \
        packages/cli/src/__tests__/meta-endpoint-hook-gen.test.ts
git commit -m "feat(cli): generate request functions and React Query hooks from the IR"
```

---

### Task 9: Search and access generators

**Files:**
- Create: `packages/cli/src/meta/generation/search-gen.ts`
- Modify: `packages/cli/src/commands/scaffold-crud.ts` — complete `SUFFIX_TO_ENUM_KEY`
- Create: `packages/cli/src/meta/generation/access-gen.ts`
- Test: `packages/cli/src/__tests__/meta-search-access-gen.test.ts`

**Output:** `generated-meta/search/<entity>.ts` and `generated-meta/access/<entity>.ts`, one file
each per entity, plus their directory barrels (spec §9). The `<Name>Params` type for each list
operation goes into `generated-meta/model/` beside the DTOs, where orval puts it.

**The search params are not in the IR — they are derived, and the derivation was verified.**
The 86 `searchDto`-bearing operations carry an **empty** `query` list (only 4 dotted query params
exist in the whole fixture). The flat params come from the named DTO's `searchable` fields crossed
with their operators, and the suffix is the `SearchOperator` **value**, not its key:
`CONTAINS` → `SearchOperator.CONTAINS` → `"contains"` → `'orgName.contains'`. Emitting
`orgName.CONTAINS` would be sent verbatim by `buildSearchableParams`, filter nothing, and raise no
error.

Measured against `OrganizationSearchDTO`: the IR derives **50** params and orval's
`ListOrganizationsParams` has **53** — the same 50, plus `page`, `size` and `sort`, which the IR
does not carry as searchable fields. So append them:

```ts
export type ListOrganizationsParams = {
  'orgId.equals'?: string;
  'orgName.contains'?: string;
  // …the 50 derived members, every one optional and quoted…
  page?: number;
  size?: number;
  sort?: string[];
};
```

Assert that exact set-equality against the fixture: a derived set that is not orval's 50 means the
operator table (Step 1b) is wrong, and the diff will say which member moved.

1118 fields carry `searchable` and 86 operations name a `searchDto`. Today the frontend re-derives filter operators by matching parameter-name suffixes with a regex; the IR states them.

- [ ] **Step 1: `search-gen` — filter metadata only.** For each operation with a `searchDto`, emit
  that DTO's fields as filter definitions: the operator list from `searchable.operators`,
  `sortable` for the column, and the label from `labelKey`.

  **This generator does not decide presentation.** `maxBadges={3}` lives in
  `templates/ui/list.hbs:78` and the `toggle` / `faceted` choice in
  `scaffold-crud.ts:1746-1749` — both are scaffold output in the app's module code, not domain
  package output. Emit the metadata those two already consume (Task 13) and change neither rule.

- [ ] **Step 1b: Translate the operator vocabulary — the two sides do not use the same names.**

  The IR reports searchable-jpa's own operator names. The frontend's `SearchOperator`
  (`packages/headless/src/filter-types.ts:2`) has keys that are mostly but **not always** the same
  string, and `scaffold-crud.ts`'s `SUFFIX_TO_ENUM_KEY` (`:1273`) covers only part of the set. An
  identity lookup silently yields `undefined`. Measured over the fixture:

  | IR operator | pairs | framework enum key | `SUFFIX_TO_ENUM_KEY` |
  | --- | ---: | --- | --- |
  | `EQUALS` | 851 | `EQUALS` | ✔ |
  | `CONTAINS` | 352 | `CONTAINS` | ✔ |
  | `IN` | 300 | `IN` | ✔ |
  | `BETWEEN` | 198 | `BETWEEN` | ✖ absent |
  | `GREATER_THAN` | 194 | `GREATER_THAN` | ✔ |
  | `LESS_THAN` | 194 | `LESS_THAN` | ✔ |
  | `GREATER_THAN_OR_EQUAL_TO` | 127 | **`GREATER_THAN_OR_EQUAL`** — no `_TO` | ✖ absent |
  | `LESS_THAN_OR_EQUAL_TO` | 127 | **`LESS_THAN_OR_EQUAL`** — no `_TO` | ✖ absent |
  | `IS_NULL` | 11 | `IS_NULL` | ✖ absent |
  | `IS_NOT_NULL` | 10 | `IS_NOT_NULL` | ✖ absent |
  | `NOT_IN` | 3 | `NOT_IN` | ✖ absent |

  Two consequences, both of which have to be handled here:

  1. **254 pairs would resolve to `undefined`** under an identity lookup — and they are the range
     bounds, so date and number range filters are exactly what breaks. Write an explicit IR-name →
     `SearchOperator` table and make it **exhaustive over the enum**, so a searchable-jpa operator
     this fixture does not contain fails loudly at generation rather than emitting `undefined`.
  2. **222 pairs name operators the suffix-matching path could never recover** (`BETWEEN`,
     `IS_NULL`, `IS_NOT_NULL`, `NOT_IN`). This is the gain the IR exists for. `SUFFIX_TO_ENUM_KEY`
     needs the four entries — `between`, `isNull`, `isNotNull`, `notIn` — or the scaffold discards
     what the generator just recovered.

  Adding those four is a change to the shared orval path, so run the existing CLI suite and
  confirm an orval domain's filters are unchanged: the map is consulted by suffix, and the four
  new keys are suffixes that path never produced.

- [ ] **Step 1c: Build range filters from the IR kind, not from the field's name.**

  `parseFilterParams` decides a date field with
  `format === "date-time" || baseField.endsWith("At") || endsWith("Date") || endsWith("Time")`
  (`scaffold-crud.ts:1393`) and then pairs `greaterThanOrEqualTo` with `lessThanOrEqualTo` into a
  `DateRangeFilter`. Both halves are worth replacing, and the fixture says why:

  | Measured | |
  | --- | ---: |
  | fields carrying **both** `gte` and `lte` | 127 |
  | fields carrying `gte`/`lte` **without** `BETWEEN` | **0** |
  | fields carrying **only** `BETWEEN` | **71** |
  | temporal fields the name-suffix test **misses** | **40** |

  Under the existing rule 71 range-capable fields get no range filter at all, and 40 temporal
  fields — `latestAmendmentOn`, `separatedSince`, `installedOn`, `nextInspectionDueOn`,
  `lockedUntil` among them — are not recognised as dates because their names end in neither `At`,
  `Date` nor `Time`. Spec §5.1 #7 already forbids inferring required-ness from a field's name; the
  same reasoning applies here, and the IR carries the kind.

  - **Decide by `TypeRef.kind ∈ {instant, date}`.** One `number` field also carries range
    operators, so a range filter is not automatically temporal.
  - **Prefer the `gte`/`lte` pair** where both exist — the 127-field case, which keeps the existing
    `DateRangeFilter` and its `pairedKey` shape unchanged.
  - **Where only `BETWEEN` exists**, the value is a **comma-joined string**, not an array. The
    generated param is `'occurredAt.between'?: string` ("Enter two values separated by comma") and
    the application already writes it by hand in 8 places as `` `${from},${to}` ``. An array
    reaches the server verbatim — `buildSearchableParams` passes non-empty arrays through
    untouched — and filters nothing, with no error.
  - **Do not route this through `transformFilters`.** It exists for exactly this and the
    application deliberately avoids it: all four references are comments explaining why, and
    `packages/console-ui/src/entity/forced-list.ts:7` records that it runs only when a `filters`
    object already exists.
  - **Set `dateOnly: true` for a `date` field and leave it unset for an `instant` one.**
    `DateRangeFilterDef.dateOnly` (`packages/ui/src/crud/filters/filter-bar.tsx`) serializes the
    boundaries as zone-neutral `yyyy-MM-dd` instead of a UTC ISO timestamp, "so date filtering
    matches the stored calendar date regardless of the browser timezone". Of the fields carrying
    range operators, **159 are `instant` and 38 are `date`**; getting those 38 wrong makes a filter
    return different rows in different browsers, with nothing to see. This is the same failure §12
    describes for `LocalDateTime`, and the IR's kind is what settles it — the orval path could only
    guess from `format`. Leave `displayZone` alone: it is a per-screen decision about a
    site-scoped column and takes precedence over `dateOnly`.

  **The vocabulary is fixed**: `FilterDef` is a seven-member union — `text`, `number`, `faceted`,
  `toggle`, `dateRange`, `country`, `timezone`. Emit one of those seven; the last two are
  special-purpose and are chosen by the screen author, not derived.

- [ ] **Step 2: `access-gen`.** For each operation, emit a permission constant from `AccessMeta`.

  **The consumer, measured:** screens call `useCan(action, subject)` — imported from
  `@simplix-react/access/react` (the subpath, not the package root), signature
  `useCan(action: string, subject: string)`, action FIRST. The subject comes from a hand-maintained
  `SUBJECTS` map, in this application at
  `packages/console-ui/src/identity/subjects.ts`. Read that file before writing the generator: its
  own doc comment states the problem this task automates — the screen names a group and the server
  names a group in `@PreAuthorize("hasPermission('<GROUP>','<action>')")`, and a literal copied to
  the call site goes stale unnoticed. The IR now carries the server's side, so the generated
  constants are the authority the map was standing in for.

  Emit, per operation: the `group` and `action` from a `permission` access, so a screen can write
  `useCan(ACCESS.orgUpdate.action, ACCESS.orgUpdate.group)` without a hand-copied literal.
  `authenticated` and `public` need no gate. **`expression` emits no gate at all** — it emits a
  comment carrying the raw SpEL, so the person building that screen decides (spec §5.1). The
  fixture has 5 of these; a generator that treated them as "no permission required" would expose
  buttons the server refuses.

  **Do not rewrite `SUBJECTS` or any screen.** This task emits constants; adopting them in module
  code is a separate decision the user has not made.

- [ ] **Step 3: Test against the real fixture.** Assert that the params derived from
  `OrganizationSearchDTO` equal orval's `ListOrganizationsParams` minus `page`/`size`/`sort` —
  50 members, set-equal, which is the single check that proves the operator table and the suffix
  form at once; that every operator name appearing in the fixture resolves to a `SearchOperator`
  member and none resolves to `undefined`; that
  `GREATER_THAN_OR_EQUAL_TO` maps to `SearchOperator.GREATER_THAN_OR_EQUAL`; that a field carrying
  only `BETWEEN` still yields a range filter whose value is a comma-joined string; that a temporal
  field whose name ends in none of `At`/`Date`/`Time` — assert
  `EquipmentInspectionDutySearchDTO.installedOn` by name — is still recognised as a date; that an unknown
  operator name throws rather than being emitted; that the operator lists come from the IR rather
  than being re-derived from parameter names; that the 5 `expression` operations yield a comment
  and no gate; and that every `permission` operation yields a group and an action.

- [ ] **Step 4: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/generation/search-gen.ts \
        packages/cli/src/meta/generation/access-gen.ts \
        packages/cli/src/__tests__/meta-search-access-gen.test.ts
git commit -m "feat(cli): generate filter and permission configuration from the IR"
```

---

### Task 10: Mock generator

**Files:**
- Create: `packages/cli/src/meta/generation/mock-gen.ts`
- Test: `packages/cli/src/__tests__/meta-mock-gen.test.ts`

- [ ] **Step 1: Write it — matching the measured layout, which is not one handler per operation.**

  Read `packages/domain-<name>/src/generated/mock/handlers.ts` in a real domain before writing
  anything. The orval path emits **one file for the whole domain**, exporting one factory per
  entity:

  ```ts
  import { http, HttpResponse } from "msw";
  import { wrapEnvelope } from "@simplix-react-ext/simplix-boot-auth"
  import type { MockEntityStore } from "@simplix-react/mock";
  import { buildEmbeddedTree } from "@simplix-react/mock";

  export function createWorkPointHandlers(store: MockEntityStore<WorkPointDetailDTO>) {
    return [
      http.post("*/api/v1/admin/work-point/create", async ({ request }) =>
        HttpResponse.json(wrapEnvelope(store.create(await request.json() as WorkPointDetailDTO)))),
      http.get("*/api/v1/admin/work-point/search", ({ request }) => {
        const url = new URL(request.url);
        const workPointId_equals = url.searchParams.get("workPointId.equals");
        if (workPointId_equals)
          return HttpResponse.json(wrapEnvelope(store.filter((i) => i.workPointId === workPointId_equals)));
        const page = Number(url.searchParams.get("page") ?? "0");
        const size = Number(url.searchParams.get("size") ?? "10");
        const sort = url.searchParams.get("sort") ?? undefined;
        return HttpResponse.json(wrapEnvelope(store.listPaged(page, size, sort)));
      }),
      // …
    ];
  }
  ```

  Four things follow from that, and three of them contradict how this task read before it was
  measured:

  1. **The generator emits no seeds.** `src/mock/seeds.ts` and `src/mock/index.ts` are
     hand-written and preserved: `index.ts` builds each store with
     `createMockEntityStore<T>(seeds, "<idField>")` and spreads the generated factories into
     `handlers`. The generator writes `generated-meta/mock/handlers.ts` and nothing else
     (spec §8).
  2. **Nothing hand-builds a page.** `store.listPaged(page, size, sort)` returns the Spring page
     shape. Do not assemble `totalElements`/`numberOfElements` in generated code, and do not reach
     for `pageOf` here — that is the zod builder Task 7 uses, not a runtime factory.
  3. **A tree operation uses `buildEmbeddedTree`** from `@simplix-react/mock`.
  4. **The grouping is the one Task 8 settles, and it is path-based.** The factory name and the
     DTO type parameter follow the entity that `splitIntoEntities` produces — not the tag — so
     call the helpers Task 8 exports rather than grouping by tag here. The store's id-field
     argument is not generated at all: `src/mock/index.ts` passes it by hand.

- [ ] **Step 2: Test** that a handler returns an enveloped body; that a search handler's paged
  branch delegates to `store.listPaged` rather than constructing a page; that a `<field>.equals`
  query parameter takes the filter branch; and that the generator writes only
  `mock/handlers.ts`, leaving an existing `src/mock/seeds.ts` and `src/mock/index.ts` untouched.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
git add packages/cli/src/meta/generation/mock-gen.ts packages/cli/src/__tests__/meta-mock-gen.test.ts
git commit -m "feat(cli): generate MSW handlers and seeds from the IR"
```

---

### Task 11: Wire parallel generation into the CLI

**Files:**
- Modify: `packages/cli/src/config/types.ts` — the `meta` block on `OpenAPISpecConfig`
- Modify: `packages/cli/src/commands/openapi.ts` — run the meta pipeline alongside orval, and add `--offline`
- Create: `packages/cli/src/meta/write.ts` — the layout writer
- Test: `packages/cli/src/__tests__/meta-parallel.test.ts`

- [ ] **Step 1: Config.** Add to `OpenAPISpecConfig`:

```ts
meta?: {
  /**
   * Endpoint URL or snapshot path. Omit it and the source is built the way the i18n download
   * already builds its own: the origin of `spec` plus the profile's `metaEndpoint`.
   */
  source?: string;
  /** Where a fetched IR is written for offline regeneration. */
  snapshot?: string;
  /** Domains whose barrel exports the meta output instead of the orval output. */
  export?: string[];
};
```

**`source` is optional on purpose.** Task 4 puts `metaEndpoint: "/api/v1/dev/meta/dto"` on the boot
profile, and a required `source` would mean every configuration repeats it — leaving `metaEndpoint`
declared and never read. Resolve in this order: `meta.source` when given; otherwise
`new URL(profile.metaEndpoint, spec).href` when `spec` is a URL and the profile carries one;
otherwise fail with a message naming both, because a silently skipped meta pipeline looks exactly
like one that ran and found nothing. `downloadI18nMessages(serverOrigin, I18N_ENDPOINT)` is the
precedent to follow.

- [ ] **Step 2: Layout.** Write into `packages/domain-<name>/src/generated-meta/` — `model/`,
  `schema/`, `endpoints/`, `hooks/`, `search/`, `access/`, `mock/`, `index.ts` (spec §9). Leave
  `src/generated/` alone.

  **Empty `generated-meta/` before writing it.** The orval path prunes — `pruneUnusedModels`
  (`openapi.ts:370`) deletes model files no endpoint references — and the meta path has no
  equivalent, so an entity or DTO that leaves the backend leaves its file behind forever. A stale
  `model/oldThing.ts` still exports a type the directory barrel still re-exports, so it compiles
  and nothing reports it. The output is wholly generated and holds no hand-edited region (unlike
  `mock/seeds.ts`), so delete the directory and rewrite it rather than adding a pruner. Assert that
  a file present before a regeneration and absent from the new IR is gone afterwards.

  **`generated-meta/index.ts` is the barrel both swaps point at, and its contents have to be
  decided here** — Task 13's template variable takes this path, and Step 3 below re-exports
  through it. Emit:

  ```ts
  export * from "./model";
  export * from "./model/_enums";
  export * from "./endpoints";
  export * from "./hooks";
  export * from "./search";
  export * from "./access";
  ```

  `schema/` is deliberately absent: `schemas.ts` re-exports zod constants separately and
  `export *` from both would collide on names (the existing type-name-conflict rule). `mock/` is
  absent because `src/mock/index.ts` imports the handler factories by path.

- [ ] **Step 1b: Add the `--offline` flag — nothing can set it today.**

  Task 2's `FetchMetaOptions` carries `offline?: boolean` and spec §12 settles that `meta.snapshot`
  "지정하면 `--offline`으로 서버 없이 재생성한다", but no task adds the flag, so the parameter is
  unreachable from the command line. `openapiCommand` currently declares `-d/--domain`,
  `-e/--entities`, `-o/--output`, `-f/--force`, `--no-http`, `-y/--yes` (`openapi.ts:73`). Add:

  ```ts
  .option("--offline", "Read the IR from meta.snapshot instead of the server")
  ```

  Fail with a message naming the snapshot path when `--offline` is passed and `meta.snapshot` is
  unset — silently falling back to the network is the opposite of what the flag asks for.

- [ ] **Step 2b: The four side artifacts — verify, do not regenerate.**

  Spec §8 requires the meta path to produce what the `openapi` command produces besides code, or
  scaffolding and validation break on a moved domain. Measured against `domain-org`, none of them
  needs regenerating, because **none references a generated path and all are keyed by entity
  name**:

  | Artifact | Keyed by | References `generated/` |
  | --- | --- | --- |
  | `crud.config.ts` | entity → hook name (`organization`, `orgType`) | no |
  | `src/locales/{ko,en,ja}.json` | entity, plus a top-level `enums` | no |
  | ↑ **the IR does not build this** — see below | | |
  | `src/translations.ts` | the domain name and the three locale files | no |
  | `http/<entity>.http` | one file per entity | no |

  So they survive the swap **exactly when the entity partition and the hook names match** — which
  is what Task 8 and spec §11 already demand. That makes this a test rather than a generator:
  after Step 3 repoints the barrels, assert that all four files are byte-identical to what they
  were before, and that `crud.config.ts`'s keys still resolve to exported hooks. A drift here is
  the loudest available signal that the entity partition diverged.

  Generate them from the IR only for a domain that never had an orval run — the greenfield case
  Task 13's scaffolding covers.

  **One of the four does break on the swap, and only at the last step.** The enum half of the
  locale overlay is filtered by `resolveKnownModelTypes` (`openapi.ts:837`), which lists
  `src/generated/model/*.ts` and derives a type name from **each filename**:

  ```ts
  const modelDir = join(targetDir, "src/generated/model");
  if (!await pathExists(modelDir)) return undefined;   // ← no filtering at all
  ```

  A meta domain keeps `generated/` until Task 14 Step 6 deletes it, so the filter works through the
  entire migration and then stops. With `undefined` returned, nothing is filtered and **all 145
  server enums land in that domain's locale file** — where `org` had 2 and `site` had 26. Nothing
  errors; the file just grows.

  Teach it the meta layout in this task, not in Task 14: `generated-meta/model/_enums.ts` holds
  every enum in **one** file, so the names come from its exported declarations rather than from
  filenames. Assert that a meta domain with `generated/` removed still filters to the same enum set
  it had before.

  **The damage is permanent, which is why this cannot be left to be noticed later.** The locale
  files are merged, never pruned: `deepMerge(existing, overlay)` lets the overlay win and keeps
  every key the overlay lacks, and nothing anywhere deletes a locale key (`pruneUnusedModels`
  covers generated models only). So one unfiltered run writes all 145 enums in, and a later run
  with the filter repaired **will not take them back out** — they have to be removed by hand.

  **Otherwise the locale files are not built from the IR, and spec §8 says so twice in conflicting
  ways.**
  The IR's `labelKey` is a message *key* (`entities.HolidayCalendar.country`); it has no
  translations. Those come from the i18n endpoint, whose payload is already structured as
  `entities.<PascalKey>.fields.<field>.translations.<locale>`, and `transformToLocaleData`
  (`cli-plugin/src/i18n.ts:98`) turns that into `{ <entityName>: { fields: { … } } }`. That path
  stays exactly as it is.

  **What the IR does contribute is the key that path currently guesses.**
  `buildEntityKeyMap` (`:82`) maps `entity.pascalName → entity.name` from the *derived* entity
  names, and `transformToLocaleData` does `if (!entityName) continue` — so when a derived name does
  not equal the Java entity's simple name, that entity's translations are dropped in silence.
  Measured: **24 server entity keys the IR names have no matching entry in any locale file,
  covering 122 fields** — `ApprovalAttachment`, `EquipmentInspectionDuty`, `FloorPlan`,
  `FloorPlanPlacement`, `ComplianceCheckItem` among them. Some belong to unconfigured domains, but
  not all.

  The IR states the server key per field, so build `entityKeyMap` from `labelKey` instead of from
  name equality, and report any server key that still finds no home. `label` (the direct-literal
  mode) occurs twice in the whole capture, both on `ValidationTestRequest` in an unmatched tag —
  handle it as a fallback and do not build anything around it.

  **Write the profile's extension files last.** After the generators run, call
  `profile.metaExtensions?.(meta)` and write each entry of `files` under `generated-meta/`. A path
  that collides with a file a generator already wrote is an error, not an overwrite — the profile
  is adding to the output, not editing it. When the profile has no `metaExtensions`, nothing
  happens and nothing is written; that is the boot profile's case today.

  Emit a per-directory `index.ts` in `model/`, `endpoints/`, `hooks/`, `search/` and `access/`,
  each re-exporting that directory's entity files. `model/index.ts` makes `export * from "./model"`
  resolve the way orval's `generated/model/index.ts` does; `endpoints/index.ts` and
  `hooks/index.ts` are what Step 3's stub layer points at, since the entity partition does not
  match orval's per-tag one. Emit `schema/index.ts` too — `schemas.ts` needs a single path to
  re-export.

- [ ] **Step 3: The re-export layer — six files, and the two partitions do not line up.**

  **`index.ts` is not yours to write — it is re-rendered on every run.** `openapi.ts:387` renders
  `domain/index-ts.hbs` with `enableOrval: true` hardcoded, then calls
  `mergeIndexWithCustomExports(newContent, existingContent)` (`:882`), which **preserves any
  `export ` line in the existing file that is absent from the freshly rendered one**. Two
  consequences, and both are silent:

  1. **A swap written here is undone by the next codegen run**, because the template renders the
     orval path again.
  2. **The revert is worse than a no-op.** Spec §10 says reverting is removing the domain from
     `export`; the template then renders `export * from "./generated/model"`, and the merge
     *preserves* the stale `export * from "./generated-meta"` beside it. TypeScript resolves two
     `export *` declarations exporting the same name by **exporting neither** — so the barrel
     silently loses every colliding type instead of reporting a conflict.

  So the `export` list has to reach **this call site**: pass the resolved path into the template
  render at `:387` (Task 13 makes it a variable) and let `writeFileWithDir` overwrite, rather than
  rewriting the file afterwards. `enableOrval` is a boolean today and a meta domain is a third
  case, so widen it there too. Assert both directions: switching a domain into `export` and running
  codegen twice leaves one export line, and taking it back out leaves the orval line alone.

  **Measured across all 13 domain packages of the target application:**

  | File | Designed for hand edits | Actually hand-edited | Rewrite |
  | --- | --- | --- | --- |
  | `index.ts` | no | 0 of 13 differ from the 3-line template | regenerate |
  | `hooks/<entity>.ts` | no | each is exactly one `export *` line | regenerate |
  | `hooks/index.ts` | no | one `export *` per stub | regenerate |
  | `schemas.ts` | yes — a comment invites overrides | **0 of 13 carry one** | keep every non-`export *` line, regenerate the block |
  | `mock/index.ts` | yes — a custom-handler slot | **0 of 13 use it** | substitute import paths only |
  | `mock/seeds.ts` | yes — the seed data | all of them | substitute import paths only |

  **`mock/seeds.ts` was missing from this list and imports `../generated/model` at line 8.** Left
  alone it survives the swap and breaks at Step 5, when `src/generated/` is deleted — long after
  the change that caused it.

  **The partitions differ, so this is not a path substitution.** Orval writes **one file per tag**
  holding the request functions *and* the hooks together
  (`generated/endpoints/site-areazone/site-areazone.ts`, with a `.zod.ts` sibling), and each
  `hooks/<entity>.ts` stub re-exports that one file. The meta layout is **per entity, split in
  two** — `generated-meta/endpoints/<entity>.ts` and `generated-meta/hooks/<entity>.ts` (spec §9)
  — and the entity partition comes from `splitIntoEntities`, which is path-based and can yield
  several entities from one tag.

  So a stub cannot be repointed by rewriting its path. Emit `endpoints/index.ts` and
  `hooks/index.ts` barrels inside `generated-meta/` and regenerate the stub layer against them;
  the stubs and `hooks/index.ts` hold nothing worth preserving, which is what the table above
  establishes. Only `schemas.ts`, `mock/index.ts` and `mock/seeds.ts` are edited in place.

  Reverting is removing the domain from `export`, which regenerates the same layer against
  `generated/` — and is why `src/generated/` is deleted last. **Verify the revert by running it**,
  not by reasoning about it: the index merge above makes a stale line survive, and a barrel that
  drops names silently looks identical to one that works until a screen imports the missing type.

- [ ] **Step 4: Test** that a domain not in `export` keeps its orval barrel byte-for-byte; that a
  domain in `export` has all four re-export files repointed; that a hand-edited region in
  `schemas.ts` survives.

- [ ] **Step 4b: Prove the generated output survives typecheck and lint — the requirement nobody
  has verified yet.**

  Spec §5.1 requires that no generated file carries `@ts-nocheck`. Orval's output carries it on
  every endpoint file precisely because it does not compile clean, and neither
  `.oxlintrc.json` nor the CLI's tsconfig excludes generated directories — so meta output is
  linted and typechecked like hand-written code. A generator that emits `@ts-nocheck` to get
  green has reproduced the defect this project exists to remove.

  Run, against a real domain package with the meta output written into it:

  ```bash
  pnpm typecheck
  pnpm lint
  ```

  Both must pass with **no `@ts-nocheck` anywhere in `generated-meta/`**:

  ```bash
  grep -rn "@ts-nocheck" packages/domain-*/src/generated-meta/ && echo "VIOLATION" || echo "clean"
  ```

  If a diagnostic is genuinely unavoidable — a Jackson shape TypeScript cannot express — report
  it with the exact message rather than suppressing it. Suppression is the one outcome this step
  exists to prevent.

- [ ] **Step 5: Run the full CLI suite, then commit**

```bash
npx vitest run --project cli
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

- [ ] **Step 1: Write it.** `simplix meta-diff <domain>` compares the public names each output
  exports and reports (spec §11).

  **Where the two sides come from — this is the whole design of the command.** Both outputs exist
  only as TypeScript on disk (`src/generated/` and `src/generated-meta/`); there is no shared
  intermediate to compare. So the command reads both trees with the compiler's parser and compares
  the declarations it finds:

  ```ts
  import ts from "typescript";

  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  ```

  Walk the top-level statements and collect, per file: exported `interface` names with each
  member's name, type text (`member.type.getText(sf)`) and whether it carries a `?`; exported
  `type` aliases; exported `const` names; and exported function/arrow names. Compare those two
  maps. Use the parser rather than a regex — an optional marker and a generic argument are exactly
  what a regex gets wrong, and getting them wrong turns this command from a gate into noise.

  Do not type-check: `createSourceFile` parses one file with no module resolution, which is what is
  wanted here and is why Task 6 also avoids `ts.createProgram`.

  Registration follows the existing shape — `export const metaDiffCommand = new Command("meta-diff")`
  in `commands/meta-diff.ts`, added in `bin.ts` with `program.addCommand(metaDiffCommand)` beside
  the other nine.

  Findings:

| Finding | Level |
| --- | --- |
| a public name present in only one — type, hook, request function, **`get<Name>QueryKey`**, const map, params type, and the mock handler factory `createXHandlers` (spec §11). Zod constants are excluded; see the info row | error |
| a `get<Name>QueryKey` returning a different **shape** | error — module code spreads the result (`[...getGetNoticeQueryKey(id), language]`), so the arity and element order are contract, not just the name |
| a field present in only one | error |
| a field type mismatch | error |
| a required-ness difference not on the intended list | error |
| a missing operation | error |
| a constraint present only on the meta side | info — OpenAPI lost it, which is the point |
| a **zod constant** name present in only one | info — orval names them per operation and role (32 for one entity), the meta path per type, and **nothing imports them**: 0 references anywhere in the application outside `generated/`. Reporting 32 renames per entity as errors would bury the drift this command exists to find |

  **Intended differences are info, not errors:** a response enum field moving from a value union to
  `LabeledEnumValue`; a field becoming required through a primitive type or
  `@Schema(requiredMode = REQUIRED)`; added request constraints. Reporting those as errors would
  bury real drift in noise.

  **Calibrate the required-ness rule against what was measured, or it will hide drift.** No
  `DetailDTO` and no `ListDTO` in the fixture carries a **single** required field. Required fields
  live on `CreateDTO` (285 across 50 types), plain `…DTO` (204/66), `UpdateDTO` (75/56) and
  non-DTO types (45/20) — that is, on request shapes and on entities, where `@NotNull` and Java
  primitives put them. §12's second ground exists in the codebase (`requiredMode` appears 17
  times) but not on a response DTO.

  So a response DTO gaining a required field is **not** the expected case this rule was written
  for: treat it as info only when the field's Java type is an unboxed primitive or the IR shows
  `@Schema(requiredMode)`, and report anything else as an error. A blanket info classification
  would silence exactly the drift `meta-diff` exists to catch.

  Both outputs must come from the same run against the same server, or the diff reports whatever the backend did in between.

- [ ] **Step 2: Test** that an identical pair reports nothing; that a removed field is an error;
  that an enum shape change is info; that a hook-name difference is an error; and that a renamed
  `createXHandlers` factory is an error — `src/mock/index.ts` imports those by name and a silent
  rename breaks every mocked screen in the domain while typecheck of the domain package alone
  still passes.

- [ ] **Step 3: Run, then commit**

```bash
npx vitest run --project cli
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
- Modify: `packages/cli/src/templates/domain/index-ts.hbs` — the same line, in the `add-domain` template
- Test: `packages/cli/src/__tests__/scaffold-meta-source.test.ts`

`scaffold-crud.ts` learns a domain's fields by regex-matching orval's emitted zod text (`X…Body = zod.object(`) and by reading `src/generated/model/<file>.ts`. Neither exists in a meta domain, and `.extend()` would not match the regex anyway — inherited fields would silently vanish from a generated form (spec §9.1).

- [ ] **Step 1: Write the IR source.** Fill the same contracts the scaffold already uses —
`FieldInfo` (`scaffold-crud.ts:29`), `EntityOperations` (`:632`), `FilterFieldInfo` (`:1243`) —
from the IR instead of from text.

**One presentation decision must come from the IR: the temporal component.** Spec §5.1 requires
that `instant`, `date` and `time` stay distinguishable *because the three use different input
components*, and §1 names their collapse as one of the eight defects this project exists to remove.
Measured, the orval path collapses them — `parseZodType` (`scaffold-crud.ts:160`) maps
`zod.iso.datetime(` to `DateField`, and `entityFieldsToFieldInfo` (`:327`) maps **both**
`format === "date-time"` and `format === "date"` to `DateField`; neither knows `time` at all.
All three framework components exist:
`packages/ui/src/fields/form/{date-field,time-field,datetime-field}.tsx`.

| IR kind | `formComponent` | `component` | n in fixture |
| --- | --- | --- | ---: |
| `instant` | `DateTimeField` | `Date` | 682 |
| `date` | `DateField` | `Date` | 202 |
| `time` | `TimeField` | `Time` | 10 |

Deferring these to the scaffold is not a neutral reuse: its branch decides from `format`, which
the IR source does not supply, so every temporal field falls through to a plain text input. For
`time` that is a defect by the frontend handbook's invariant #37, which requires `TimeField` and
forbids a `type="time"` text input.

**The rest of `FieldInfo` is half data, half presentation, and the IR does not carry the
presentation half.** From the IR: `name`, `tsType`, `label` (via `labelKey`), `options` (enum
values), required-ness, and everything `FilterFieldInfo` needs. NOT from the IR: `inputType`,
`defaultValue`, `capitalizedName`, `isForeignKey`, `fkEntityField`, `isSystemField`, `isI18nPair`,
`baseFieldName`, `category`, `hideInList` — those are decisions the scaffold already makes, as are
`formComponent` and `component` for every kind but the three above.

**Reuse the existing derivations rather than re-deriving them**, or a meta domain and an orval
domain will scaffold differently for the same field:

| Need | Reuse |
| --- | --- |
| category and column order | `orderAndCategorizeFields(FieldInfo[]): FieldInfo[]` (exported) |
| `defaultValue` from a TS type | `getDefaultValue(tsType: string): string` (exported) |
| the field → `FieldInfo` shape | **`parseZodType`, not `entityFieldsToFieldInfo`** — see below |

**The precedent is `parseZodType`, and the plan previously named the wrong one.** There are two
field sources in `scaffold-crud.ts` and they are not equivalent: `parseZodType` (`:130`, called at
`:470`) is the primary path that reads orval's zod text, and `entityFieldsToFieldInfo` (`:286`,
called at `:1622`) is a **documented fallback** — its own comment says "when Zod schema parsing
fails (e.g. read-only entities with no Body schema)". They disagree:

| | `parseZodType` (primary) | `entityFieldsToFieldInfo` (fallback) |
| --- | --- | --- |
| a temporal field's `tsType` | `"Date"` (from `zod.iso.datetime(`) | `"string"` (from `format`) |
| `defaultValue` that follows | `new Date()` | `""` |
| an `object` / `array` field | typed (`string` for a string array, `Record<string, string>` for an i18n map) | **dropped**, unless the name ends `I18n` |

Following the fallback would silently change every date field's initial value and drop the 278
container and 38 `ref` fields the IR carries. Mirror `parseZodType`'s decisions instead, mapping
from `TypeRef.kind` rather than from zod text, and keep `tsType: "Date"` for `instant` and `date`
so `getDefaultValue` keeps returning `new Date()`.

**`FieldInfo.tsType` is not the model interface's type.** Task 6 emits `string` for `instant` and
`date` in `model/<entity>.ts`, which is correct — the wire carries an ISO string. `FieldInfo.tsType`
is a scaffold-internal signal feeding `getDefaultValue` and the component choice, and there the
orval path uses `Date`. Keep them different on purpose, and say so in your report.

**One helper is not reusable:** `detectI18nFieldPairs` (`:265`) is not exported. The `xxxI18n`
map pairing it performs is keyed on field NAMES, so it works the same on IR-derived fields — but
you cannot call it. Export it, or reproduce it; do not skip it, or a meta domain loses its
multilingual field pairing while an orval domain keeps it. Say which you did.

Filter operators come from `searchable.operators` — never from parameter-name suffixes, which is
what the orval path has to do. Labels come from `labelKey`.

- [ ] **Step 2: Choose per domain.** If `generated-meta/` exists for the domain, use the IR source; otherwise the existing text-parsing source, unchanged.

- [ ] **Step 3: Templates — BOTH of them.** The line `export * from "./generated/model";` appears
  in two barrel templates, and changing one leaves the other emitting the orval path:

  | Template | Emitted by | Shape |
  | --- | --- | --- |
  | `templates/openapi/user-index-ts.hbs` | `simplix openapi` | unconditional |
  | `templates/domain/index-ts.hbs` | `simplix add-domain` | inside `{{#if enableOrval}}`; the `{{else}}` branch exports `./schemas` and `./contract` |

  Make the model path a variable in both; for a meta domain it takes `"./generated-meta"`, the
  barrel Task 11 Step 2 emits, not `"./generated-meta/model"` — the barrel already carries the
  enums, endpoints, hooks, search and access alongside the models. A meta domain matches neither
  existing branch of `domain/index-ts.hbs` — it has no `generated/model` and no hand-written
  `contract.ts` — so that template needs the meta shape as its own case, not a reuse of
  `{{else}}`.

  Verify with `grep -rn "generated/model" packages/cli/src/templates/` returning nothing but the
  variable form. The UI templates need no change — they import from the package barrel by name,
  never from `generated/` (verified).

- [ ] **Step 4: Test** that scaffolding a meta domain produces the same `FieldInfo` set as the IR describes, including inherited fields; that a filter's operators come from the IR; that an `instant` field yields `DateTimeField`, a `date` field `DateField` and a `time` field `TimeField`, none of them a text input; and that an orval domain still scaffolds identically to before.

- [ ] **Step 5: Run the full suite, then commit**

```bash
npx vitest run --project cli && pnpm typecheck
git add packages/cli/src/meta/scaffold-source.ts packages/cli/src/commands/scaffold-crud.ts \
        packages/cli/src/templates/openapi/user-index-ts.hbs \
        packages/cli/src/__tests__/scaffold-meta-source.test.ts
git commit -m "feat(cli): let scaffolding read fields from the IR"
```

---

### Task 14: Move one domain end to end

- [ ] **Step 1** — the captured IR is at `smart-safety-frontend/openapi/meta.json` (2.7 MB) but
  is **untracked**; decide with the user whether to commit it before relying on it, since the
  repository is shared with another session. Add the `meta` block to that project's
  `simplix.config.ts` pointing at it, and leave `export` empty. Run codegen; both outputs exist.
- [ ] **Step 2** — run `simplix meta-diff` on **`org`**. Measured operation counts per domain:
  `dashboard` 1, `org` 13, `audit` 15, `worker` 16, `approval` 31, `site` 32, `auth` 39,
  `space` 46, `system` 64, `regulation` 81, `user` 100, `notification` 139. `dashboard` is the
  smallest but exercises almost nothing — one operation, no CRUD shape. `org` is the pilot:
  small enough to read end to end, and its 13 operations are measured to cover more than a plain
  CRUD set. **It is a tree domain**, and that is deliberate — a pilot that skipped the hard shapes
  would prove nothing about the rest:

  | Shape | Operations |
  | --- | --- |
  | create / list / detail / edit-form / update / delete | `POST /create`, `GET /search`, `GET /{orgId}`, `GET /{orgId}/edit`, `PUT /{orgId}`, `DELETE /{orgId}` |
  | **tree** | `GET /tree`, `GET /tree/{orgId}` — exercises `buildEmbeddedTree` in the mock |
  | **reorder** | `PATCH /order` — a `List<XOrderDTO>` body, one of the 49 Task 0 repairs |
  | **multi-update** | `PATCH` — a `Set<XUpdateDTO>` body, likewise |
  | **batch** | `PATCH /batch`, `DELETE /batch` |
  | second entity | `GET /org-type` under `org.OrgType` |

  Also measured: one `searchDto` (`OrganizationSearchDTO`), every operation gated by a
  `permission` access with no `expression` case, and the app already has screens at
  `modules/org/src/pages/organization` for Step 5 to drive. Verify each row above rather than
  stopping once create and list work.
  Drive the diff to zero errors and record every info-level difference in the task report.
- [ ] **Step 3** — add that domain to `export`. Run `pnpm typecheck` and `pnpm build`.
- [ ] **Step 4** — scaffold into a scratch directory and diff, **not into the module.**

  `scaffold-crud.ts` skips every file that already exists (`:929`, `:1945`), and
  `modules/org/src/widgets/organization/` already holds eight hand-written files —
  `tree.tsx`, `accounts-tab.tsx`, `scope-reference.tsx`, `use-organization-saved.ts` among them.
  Run against the module, the command writes nothing and there is no output to compare, so the
  check silently passes while proving nothing. Use the explicit output instead, which bypasses the
  module path entirely:

  ```bash
  simplix scaffold organization --output /tmp/meta-scaffold/org-meta
  git stash   # or point the config at the orval path
  simplix scaffold organization --output /tmp/meta-scaffold/org-orval
  diff -ru /tmp/meta-scaffold/org-orval /tmp/meta-scaffold/org-meta
  ```

  Read the diff. Field order, component choice and filter definitions must match, except for the
  three temporal components Task 13 deliberately changes (`DateTimeField` / `DateField` /
  `TimeField` where the orval path emitted `DateField` or a text input).

  **Report, do not fix:** `ensureSubjectsFile` (`:947`) writes
  `modules/<name>/src/shared/auth/subjects.ts`, and **no module in this application has that
  file** — the permission-subject map lives at `packages/console-ui/src/identity/subjects.ts`
  instead. A scaffold run into a real module would create a second map nothing imports. That is a
  pre-existing divergence between the CLI's convention and the app's, not something this project
  introduced; surface it and let the user decide.
- [ ] **Step 5** — drive the screens in a browser under the `simplix:frontend-e2e` skill. A green typecheck is not evidence a screen works.
- [ ] **Step 6** — report: which domain, the info-level differences, what the browser pass found.
  **After deleting `src/generated/`, re-run codegen once and diff `src/locales/*.json`** — the enum
  filter reads that directory and silently stops filtering without it (Task 11 Step 2b). The file
  must hold the same enum set as before, not all 145. **Do not delete `src/generated/` yet** — that is the last step after the domain has been exercised, and it is what makes the move irreversible.
