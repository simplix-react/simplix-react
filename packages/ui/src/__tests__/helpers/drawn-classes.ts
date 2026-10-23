import type { SlotStyle } from "../../design/slot-style";

// Vite's import.meta.glob, which vitest provides at run time; this package's tsconfig carries no
// Vite client types, so the one call is typed here.
type Glob = (pattern: string, options: { eager: true }) => Record<string, Record<string, unknown>>;
const modules = (import.meta as unknown as { glob: Glob }).glob("../../**/*.style.ts", { eager: true });
const isSlotStyle = (v: unknown): v is SlotStyle =>
  !!v && typeof v === "object" && typeof (v as SlotStyle).slot === "string" && typeof (v as SlotStyle).base === "string";
const bySlot = new Map<string, SlotStyle>();
for (const mod of Object.values(modules)) for (const v of Object.values(mod as Record<string, unknown>)) if (isSlotStyle(v)) bySlot.set(v.slot, v);

/** The declared classes for one declaration and the axis values an element carries for it. */
function declared(style: SlotStyle | undefined, axisValue: (axis: string) => string | null): string[] {
  if (!style) return [];
  const parts = [style.base];
  for (const [axis, values] of Object.entries(style.variants)) {
    const value = axisValue(axis);
    if (value !== null && values[value]) parts.push(values[value]);
  }
  return parts;
}

/**
 * The classes an element is drawn with under the classic design: its own className plus the
 * classes classic.css applies for its `data-slot` and `data-<axis>` attributes, then for its
 * `data-part` and `data-part-<axis>` attributes (a part rule wins over the slot rule, so it comes
 * last).
 */
export function drawnClasses(element: Element | null): string {
  if (!element) return "";
  const own = element.getAttribute("class") ?? "";
  const slot = declared(bySlot.get(element.getAttribute("data-slot") ?? ""), (axis) =>
    element.getAttribute(`data-${axis}`),
  );
  const part = declared(bySlot.get(element.getAttribute("data-part") ?? ""), (axis) =>
    element.getAttribute(`data-part-${axis}`),
  );
  return [...slot, own, ...part].join(" ").trim();
}
