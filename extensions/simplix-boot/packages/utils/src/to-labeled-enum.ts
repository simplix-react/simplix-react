import type { LabeledEnumValue } from "./labeled-enum-value.js";

/**
 * The wire shape a labeled enum reaches a response as, built from a bare value.
 *
 * The inverse of `resolveBootEnum`, and needed for the same reason: a DTO reached from both a
 * request and a response carries the object in both directions, so code that holds a value — a
 * select's choice, a constant, a field the operator typed — has to put it back under that shape
 * before sending it.
 *
 * The label is the value. The server reads only `value`, and a response overwrites the pair with
 * the localized text the next time the record is read, so inventing anything else here would put
 * a label on screen that no message bundle chose.
 */
export function toLabeledEnum<T extends string>(value: T): LabeledEnumValue<T>;
export function toLabeledEnum<T extends string>(
  value: T | undefined,
): LabeledEnumValue<T> | undefined;
export function toLabeledEnum<T extends string>(
  value: T | undefined,
): LabeledEnumValue<T> | undefined {
  return value === undefined ? undefined : { value, label: value };
}
