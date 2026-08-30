/**
 * A labeled enum value as the Boot backend sends it.
 *
 * The server serializes an enum implementing `LabeledEnum` as an object, not a bare string, so
 * a response field holding one is `LabeledEnumValue<"ACTIVE" | "RETIRED">` rather than the union
 * itself. Comparing such a field to a bare string is a type error — which is the point: it was
 * previously a silent runtime falsehood.
 *
 * The two members are the whole contract. `LabeledEnum` is annotated
 * `@JsonFormat(shape = OBJECT)` with `name()` bound to `value`, and the framework's serde test
 * asserts the serialized object carries exactly `value` and `label`.
 */
export interface LabeledEnumValue<T extends string = string> {
  value: T;
  label: string;
}
