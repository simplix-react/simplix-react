/**
 * How a design other than classic is drawn from the slot declarations.
 *
 * <p>build-design-css takes every declaration's classic classes, swaps each class the spec's
 * `replace` names, then merges the spec's override for that slot (key `"<slot>"` for the base,
 * `"<slot> <axis>=<value>"` for a variant value) over the result with tailwind-merge, so an
 * override replaces the classes it conflicts with and keeps the rest. A design drawn this way
 * covers every slot classic draws. Behaviour classes (display, position, overflow, size) are on
 * the elements, never in a declaration, so a spec only ever changes look.
 */
export interface DesignSpec {
  /** The `data-design` value the generated rules are scoped to. */
  id: string;
  /** Class → class swaps applied to every declaration; an empty string drops the class. */
  replace?: Record<string, string>;
  /** Per slot (and per slot variant value) classes merged over the swapped classes. */
  slots?: Record<string, string>;
}
