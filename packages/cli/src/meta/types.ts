// TypeScript mirror of SimpliX Meta served by `GET /dev/meta/dto`.
//
// This file has no logic — it is a structural mirror of the Java records under
// `dev.simplecore.simplix.web.meta.model` in spring-boot-starter-simplix. Every record there
// is annotated `@JsonInclude(NON_NULL)`, which drops a member from the wire only when its Java
// value is `null`. An unboxed primitive (`boolean`, `int`) is never `null`, so it is always
// present; a `List`/`Map` member is always constructed non-null by the generator, so it is
// always present too (as `[]` or `{}` when empty). Only a genuinely absent object or boxed
// value is dropped, and that is what the `?` below marks.

/**
 * Discriminated type reference. `kind` selects which other members are meaningful; unlisted
 * members are absent from the wire, mirroring `TypeRef`'s `@JsonInclude(NON_NULL)` fields.
 *
 * - `string` / `boolean` / `unknown` / `instant` / `date` / `file` / `binary` — `kind` only.
 * - `number` — integer vs. floating-point, per `integral`.
 * - `time` — a `LocalTime`-shaped value; `pattern` carries its format string when constrained.
 * - `enum` — `name` is the key into `DtoMeta.enums`.
 * - `ref` — `name` is the key into `DtoMeta.types`; `args` carries generic type arguments
 *   when the referenced type is itself generic.
 * - `param` — `name` is a type parameter of the enclosing generic type (see `TypeMeta.typeParams`).
 * - `container` — a built-in generic wrapper (`List`, `Map`, `Page`, `SimpliXApiResponse`);
 *   `args` holds its type arguments.
 * - `pick` — a structural subset of the type named by `of`, restricted to `fields`.
 */
export type TypeRef =
  | { kind: "string" | "boolean" | "unknown" | "instant" | "date" | "file" | "binary" }
  | { kind: "number"; integral: boolean }
  | { kind: "time"; pattern?: string }
  | { kind: "enum"; name: string }
  | { kind: "ref"; name: string; args?: TypeRef[] }
  | { kind: "param"; name: string }
  | { kind: "container"; name: string; args: TypeRef[] }
  | { kind: "pick"; of: string; fields: string[] };

/**
 * One jakarta validation constraint on a field.
 *
 * `value` is a JSON number for a numeric-bound `kind` sourced from `@Min`/`@Max`
 * (integral bounds), but a JSON **string** for the same `min`/`max` kind sourced from
 * `@DecimalMin`/`@DecimalMax` (arbitrary-precision decimal bounds) — the two annotations
 * share a `kind`, so the wire type of `value` is the only way to tell them apart.
 * `name` is populated only for `kind: "custom"`, carrying the annotation's simple name.
 */
export interface ConstraintMeta {
  kind: string;
  value?: number | string;
  name?: string;
}

/** Search capability of a field, read from `@SearchableField`. */
export interface SearchableMeta {
  operators: string[];
  sortable: boolean;
  entityField?: string;
  sortField?: string;
}

/** One serialized property of a DTO. `name` is the wire name after Jackson. */
export interface FieldMeta {
  name: string;
  type: TypeRef;
  required: boolean;
  nullable: boolean;
  description?: string;
  labelKey?: string;
  label?: string;
  constraints?: ConstraintMeta[];
  searchable?: SearchableMeta;
}

/**
 * One DTO type. `fields` carries ONLY this type's own fields — inherited fields live on the
 * type named by `extends` and are not repeated here.
 */
export interface TypeMeta {
  javaClass: string;
  extends?: string;
  typeParams: string[];
  description?: string;
  fields: FieldMeta[];
}

export interface EnumValueMeta {
  name: string;
  labelKey?: string;
}

/** Enum registry entry. `labeled` marks the `{ value, label }` wire shape used by the UI layer. */
export interface EnumMeta {
  labeled: boolean;
  values: EnumValueMeta[];
}

/** Structured `@PreAuthorize` so the frontend never parses SpEL. */
export type AccessMeta =
  | { kind: "permission"; group: string; action: string }
  | { kind: "authenticated" }
  | { kind: "public" }
  | { kind: "expression"; raw: string };

/** A query or path parameter of an operation. */
export interface ParamMeta {
  name: string;
  type: TypeRef;
  required: boolean;
  description?: string;
}

/**
 * Request side of an operation. `searchDto` names the DTO whose `@SearchableField`s define
 * this operation's flattened search params.
 *
 * `body` is a `TypeRef` rather than a type name because a body is frequently a generic container —
 * `Set<XUpdateDTO>` for a multi-update, `List<XOrderDTO>` for a reorder. A bare name erases the
 * element type, leaving nothing to emit.
 */
export interface RequestMeta {
  body?: TypeRef;
  contentType?: string;
  query: ParamMeta[];
  path: ParamMeta[];
  searchDto?: string;
}

/** One handler method. `response` is the full container-wrapped `TypeRef`; absent means `void`. */
export interface OperationMeta {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  tag: string;
  summary?: string;
  response?: TypeRef;
  access: AccessMeta;
  request: RequestMeta;
}

/** Root SimpliX Meta document served by `GET /dev/meta/dto`. */
export interface DtoMeta {
  version: number;
  enums: Record<string, EnumMeta>;
  types: Record<string, TypeMeta>;
  operations: OperationMeta[];
  extensions?: Record<string, unknown>;
}
