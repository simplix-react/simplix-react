import { cva } from "class-variance-authority";

/** Variant axes of a slot: axis name → value → utility classes. */
export type SlotVariants = Record<string, Record<string, string>>;

/** The default value per variant axis, `true` / `false` for boolean axes. */
export type SlotDefaults<V extends SlotVariants> = { [K in keyof V]?: keyof V[K] | boolean };

/**
 * How one slot looks in the classic design.
 *
 * <p>A component declares the look it draws as data rather than as a class string on its element.
 * The element carries `data-slot` and one `data-<axis>` attribute per variant axis, and the
 * classic stylesheet (`theme/designs/classic.css`, generated from these declarations) draws the
 * slot from those attributes. Another design draws the same slot from the same attributes with
 * rules of its own, so a component's behaviour is written once and its look once per design.
 */
export interface SlotStyle<V extends SlotVariants = SlotVariants> {
  /** The `data-slot` value the element carries. */
  slot: string;
  /** Classes every instance draws. */
  base: string;
  /** Classes per variant value. */
  variants: V;
  /** The value an axis takes when the caller passes none. */
  defaultVariants: SlotDefaults<V>;
  /**
   * How elements carry the declaration: as their own slot (`slotAttributes`, the default) or as
   * a part of another component (`partAttributes`).
   */
  as?: "slot" | "part";
}

/** Declares a slot's classic look; see {@link SlotStyle}. */
export function defineSlotStyle<V extends SlotVariants>(style: SlotStyle<V>): SlotStyle<V> {
  return style;
}

/**
 * Prefix of the attribute naming one slot (`data-s-button`), and of the one naming one part.
 *
 * <p>Safari files a style rule under the last attribute name in its rightmost compound and checks
 * an element only against the rules filed under the attributes it carries. Keyed on `data-slot`
 * alone, every rule of every slot is filed under that one name and checked against every slot
 * element on every style update; keyed on an attribute per slot, an element meets only its own
 * slot's rules.
 */
export const SLOT_KEY = "data-s-";
/** See {@link SLOT_KEY}. */
export const PART_KEY = "data-p-";

/**
 * Whether an attribute name is one of those {@link partAttributes} writes, for a component that
 * passes a caller's part attributes on to the element that draws the part.
 */
export function isPartAttribute(name: string): boolean {
  return name.startsWith("data-part") || name.startsWith(PART_KEY);
}

/** A variant prop as the caller passes it: a value name, or a boolean for a true/false axis. */
type AxisValue = string | boolean | null | undefined;

/**
 * The attributes an element of this slot carries for the variants in force.
 *
 * @param style - the slot's declaration
 * @param props - the caller's variant values; an absent one takes the declared default
 * @returns `data-slot`, `data-s-<slot>` and `data-<axis>` for every declared axis
 */
export function slotAttributes<V extends SlotVariants>(
  style: SlotStyle<V>,
  props: { [K in keyof V]?: AxisValue },
): Record<string, string> {
  // data-s-<slot> is the attribute the design stylesheets key each rule on; see SLOT_KEY.
  const attributes: Record<string, string> = { "data-slot": style.slot, [`${SLOT_KEY}${style.slot}`]: "" };
  for (const axis of Object.keys(style.variants)) {
    const given = props[axis as keyof V];
    const value = given ?? style.defaultVariants[axis as keyof V];
    if (value !== undefined && value !== null) attributes[`data-${axis}`] = String(value);
  }
  return attributes;
}

/**
 * The attributes that mark an element as a part another component renders.
 *
 * <p>A component that renders a framework part (a `PopoverContent`, a `Badge`, a `Stack`) cannot
 * give that element a slot of its own: the part writes its own `data-slot`, which is what its
 * own look hangs on. It marks the element with `data-part` instead, and the design stylesheets
 * draw the part rule on top of the part's own slot rule (a part rule carries one class worth of
 * specificity, so it wins over the slot rules without depending on file order).
 *
 * @param style - the declaration of how the part looks in this place
 * @param props - the caller's variant values; an absent one takes the declared default
 * @returns `data-part`, `data-p-<part>` and `data-part-<axis>` for every declared axis
 */
export function partAttributes<V extends SlotVariants>(
  style: SlotStyle<V>,
  props: { [K in keyof V]?: AxisValue },
): Record<string, string> {
  const attributes: Record<string, string> = { "data-part": style.slot, [`${PART_KEY}${style.slot}`]: "" };
  for (const axis of Object.keys(style.variants)) {
    const given = props[axis as keyof V];
    const value = given ?? style.defaultVariants[axis as keyof V];
    if (value !== undefined && value !== null) attributes[`data-part-${axis}`] = String(value);
  }
  return attributes;
}

/**
 * The slot's classic look as a class-string function, for callers that style an element of
 * their own to look like this slot.
 */
export function slotClassNames<V extends SlotVariants>(style: SlotStyle<V>) {
  // A boolean axis declares its default as `true` / `false`; cva's config type spells the same
  // value as the key string, so the declaration is handed over as cva's own config type.
  const config = { variants: style.variants, defaultVariants: style.defaultVariants };
  return cva<V>(style.base, config as unknown as Parameters<typeof cva<V>>[1]);
}
