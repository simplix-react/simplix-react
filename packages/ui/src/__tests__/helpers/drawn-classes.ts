import type { SlotStyle } from "../../design/slot-style";

const modules = import.meta.glob<Record<string, unknown>>("../../**/*.style.ts", { eager: true });
const isSlotStyle = (v: unknown): v is SlotStyle =>
  !!v && typeof v === "object" && typeof (v as SlotStyle).slot === "string" && typeof (v as SlotStyle).base === "string";
const bySlot = new Map<string, SlotStyle>();
for (const mod of Object.values(modules)) for (const v of Object.values(mod)) if (isSlotStyle(v)) bySlot.set(v.slot, v);

/**
 * The classes an element is drawn with under the classic design: its own className plus the
 * classes classic.css applies for its `data-slot` and `data-<axis>` attributes.
 */
export function drawnClasses(element: Element | null): string {
  if (!element) return "";
  const own = element.getAttribute("class") ?? "";
  const style = bySlot.get(element.getAttribute("data-slot") ?? "");
  if (!style) return own;
  const parts = [style.base];
  for (const [axis, values] of Object.entries(style.variants)) {
    const value = element.getAttribute(`data-${axis}`);
    if (value !== null && values[value]) parts.push(values[value]);
  }
  return [...parts, own].join(" ").trim();
}
