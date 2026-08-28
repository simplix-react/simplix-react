// Holding two generated output trees against each other.
//
// What the pipelines are contracted to produce in common is compared; the rest of what orval emits
// is excluded when the tree is read, never here.

import { splitUnion, type Decl, type Surface } from "./diff-surface.js";

/**
 * The one condition under which a diff means anything, said wherever the command speaks.
 *
 * The two trees are compared as they sit on disk, so a tree written before a backend change and
 * one written after it disagree about the backend rather than about the pipelines.
 */
export const SAME_RUN_NOTE =
  "Both trees must come from the same `simplix openapi` run against the same server; " +
  "a diff taken across two runs reports whatever the backend changed in between.";

/** A name difference the project has already accounted for. */
export interface RenameExpectation {
  orval: string | string[];
  meta: string | string[];
  /** Why the two disagree, printed with the finding. */
  reason?: string;
}

/**
 * What this project knows that the two trees cannot say for themselves.
 *
 * None of it is built in. A tag the backend annotates differently from the way springdoc reads
 * it, and a field made required by `@Schema(requiredMode = REQUIRED)`, are facts about one
 * backend; the IR carries neither downstream, so the only honest place for them is a file the
 * project owns and passes with `--expect`.
 */
export interface Expectations {
  renames: RenameExpectation[];
  /**
   * `Type.field` entries whose required-ness legitimately differs — the server-side ground for
   * the requirement (`@Schema(requiredMode)`, `@NotNull`) survives into neither tree.
   */
  requiredFields: string[];
  /** Names that exist in one output by design. */
  ignore: string[];
}

export type Level = "error" | "info";

export interface Finding {
  level: Level;
  /** A name, or `Type.field`. */
  subject: string;
  message: string;
}

/** An empty expectation set, which is what a project that has declared nothing runs with. */
export function emptyExpectations(): Expectations {
  return { renames: [], requiredFields: [], ignore: [] };
}

// ── Comparison ────────────────────────────────────────────────────────────────

/** Java's unboxed primitives, as the two pipelines spell them, and the only ground either shows. */
const PRIMITIVE_TYPES = new Set(["boolean", "number"]);

/**
 * Whether the meta side wraps what the orval side left bare — an enum field carrying its label
 * beside its value rather than the value alone.
 *
 * The wrapper is named by the spec profile rather than by this command, so it is recognised by
 * its shape: one generic applied to what the other side declared, or to a value union the other
 * side spelled out.
 */
function isLabelWidening(orvalType: string, metaType: string): boolean {
  let left = orvalType;
  let right = metaType;
  while (left.endsWith("[]") && right.endsWith("[]")) {
    left = left.slice(0, -2).trim();
    right = right.slice(0, -2).trim();
  }
  const applied = /^([A-Za-z_$][\w$]*)<(.+)>$/.exec(right);
  if (applied === null) return false;
  const inner = applied[2].trim();
  return inner === left || isStringLiteralUnion(left);
}

function isStringLiteralUnion(text: string): boolean {
  const parts = splitUnion(text);
  return parts.length > 0 && parts.every((one) => /^".*"$/.test(one));
}

/** Compare the two surfaces and return every finding, errors and notes alike. */
export function compareSurfaces(
  orval: Surface,
  meta: Surface,
  expectations: Expectations = emptyExpectations(),
): Finding[] {
  const findings: Finding[] = [];
  const accounted = new Set<string>();
  const ignored = new Set(expectations.ignore);

  for (const rename of expectations.renames) {
    const from = toList(rename.orval);
    const to = toList(rename.meta);
    const matches =
      from.every((name) => orval.declarations.has(name) && !meta.declarations.has(name)) &&
      to.every((name) => meta.declarations.has(name) && !orval.declarations.has(name));
    if (!matches) continue;
    for (const name of [...from, ...to]) accounted.add(name);
    findings.push({
      level: "info",
      subject: from.join(", "),
      message:
        `the orval output names it ${from.join(", ")} and the meta output ${to.join(", ")}` +
        (rename.reason ? ` — ${rename.reason}` : ""),
    });
  }

  const names = [...new Set([...orval.declarations.keys(), ...meta.declarations.keys()])].sort();
  for (const name of names) {
    if (accounted.has(name)) continue;
    const left = orval.declarations.get(name);
    const right = meta.declarations.get(name);

    if (left === undefined || right === undefined) {
      const decl = left ?? right;
      if (decl === undefined) continue;
      const side = left === undefined ? "meta" : "orval";
      // Orval names a zod constant per operation and role and the meta pipeline names one per
      // type, so one entity's constants are renamed wholesale. Nothing outside the generated
      // directories imports them, so reporting the renames as errors would bury the drift this
      // command exists to find.
      const level: Level = decl.category === "zod" || ignored.has(name) ? "info" : "error";
      findings.push({
        level,
        subject: name,
        message: `present only in the ${side} output (${decl.category}, ${decl.file})`,
      });
      continue;
    }

    findings.push(...compareQueryKey(name, left, right));
    findings.push(...compareMembers(name, left, right, expectations));
  }

  return findings;
}

function compareQueryKey(name: string, left: Decl, right: Decl): Finding[] {
  const before = left.queryKeyShape;
  const after = right.queryKeyShape;
  if (before === undefined || after === undefined) return [];
  if (before.join(",") === after.join(",")) return [];
  return [
    {
      level: "error",
      subject: name,
      message:
        `returns [${before.join(", ")}] in the orval output and [${after.join(", ")}] in the ` +
        "meta output; module code spreads the result, so its arity and element order are contract",
    },
  ];
}

function compareMembers(
  name: string,
  left: Decl,
  right: Decl,
  expectations: Expectations,
): Finding[] {
  if (left.members === undefined || right.members === undefined) return [];
  const findings: Finding[] = [];
  const required = new Set(expectations.requiredFields);
  const fields = [...new Set([...left.members.keys(), ...right.members.keys()])].sort();

  for (const field of fields) {
    const subject = `${name}.${field}`;
    const before = left.members.get(field);
    const after = right.members.get(field);

    if (before === undefined || after === undefined) {
      findings.push({
        level: "error",
        subject,
        message: `present only in the ${before === undefined ? "meta" : "orval"} output`,
      });
      continue;
    }

    if (before.type !== after.type) {
      findings.push(
        isLabelWidening(before.type, after.type)
          ? {
              level: "info",
              subject,
              message: `carries its label in the meta output: ${before.type} → ${after.type}`,
            }
          : {
              level: "error",
              subject,
              message: `is ${before.type} in the orval output and ${after.type} in the meta output`,
            },
      );
    }

    if (before.optional === after.optional) continue;

    if (before.optional && !after.optional) {
      // Neither tree records why a field is required — an unboxed Java primitive, a `@NotNull`
      // and a `@Schema(requiredMode = REQUIRED)` all arrive as the same missing `?`. So the only
      // grounds this command can see are a primitive-shaped type and what the project declared;
      // everything else is drift and is reported as one.
      const grounded = PRIMITIVE_TYPES.has(after.type) || required.has(subject);
      findings.push({
        level: grounded ? "info" : "error",
        subject,
        message: grounded
          ? "is required in the meta output, which OpenAPI lost"
          : "is required in the meta output with no primitive type or declared ground for it",
      });
      continue;
    }

    findings.push({
      level: "error",
      subject,
      message: "is required in the orval output and optional in the meta output",
    });
  }

  return findings;
}

function toList(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}
