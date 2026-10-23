import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";

import { slotAttributes } from "../design/slot-style";
import { segmentedControlItemStyle, segmentedControlStyle, segmentedControlThumbStyle } from "./segmented-control.style";

export interface SegmentedControlOption<K extends string> {
  key: K;
  label: string;
}

export interface SegmentedControlProps<K extends string> {
  /** What the choices choose, for a screen reader. */
  label: string;
  options: readonly SegmentedControlOption<K>[];
  value: K;
  onChange: (key: K) => void;
}

/**
 * Mutually exclusive choices drawn as one control, with a thumb that slides to the chosen one.
 *
 * <p>A tab list to assistive technology: the chosen item is the one tab stop and the arrow keys,
 * Home and End move the choice. The thumb is measured off the chosen item, so labels of any
 * length keep it under the right word; it slides over the duration token, which is 0 with
 * reduced motion.
 */
export function SegmentedControl<K extends string>({ label, options, value, onChange }: SegmentedControlProps<K>) {
  const items = useRef(new Map<K, HTMLButtonElement>());
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = items.current.get(value);
      if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const el = items.current.get(value);
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, options]);

  const onKeyDown = (e: KeyboardEvent) => {
    const at = options.findIndex((o) => o.key === value);
    const next =
      e.key === "ArrowRight" ? (at + 1) % options.length
      : e.key === "ArrowLeft" ? (at - 1 + options.length) % options.length
      : e.key === "Home" ? 0
      : e.key === "End" ? options.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    const key = options[next].key;
    onChange(key);
    items.current.get(key)?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="relative inline-flex w-fit self-start" onKeyDown={onKeyDown} {...slotAttributes(segmentedControlStyle, {})}>
      <span
        aria-hidden="true"
        className="absolute bottom-0.5 left-0 top-0.5"
        style={{ width: thumb?.w ?? 0, transform: `translateX(${thumb?.x ?? 0}px)`, visibility: thumb ? "visible" : "hidden" }}
        {...slotAttributes(segmentedControlThumbStyle, {})}
      />
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <button
            key={o.key}
            ref={(el) => {
              if (el) items.current.set(o.key, el);
              else items.current.delete(o.key);
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.key)}
            className="relative z-[1]"
            {...slotAttributes(segmentedControlItemStyle, { selected })}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
