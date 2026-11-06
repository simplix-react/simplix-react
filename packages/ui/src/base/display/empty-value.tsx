import type { ReactNode } from "react";

import { slotAttributes } from "../../design/slot-style";
import { emptyValueStyle } from "./empty-value.style";

/**
 * The text a "no value" placeholder draws: one hyphen-minus. Every placeholder a screen or a
 * kit draws for an absent value reads it from here, so the glyph is decided in one place.
 */
export const EMPTY_VALUE_TEXT = "-";

/** Props for the {@link EmptyValue} component. */
export interface EmptyValueProps {
  /** Placeholder content; defaults to {@link EMPTY_VALUE_TEXT}. */
  children?: ReactNode;
  className?: string;
}

/**
 * Muted placeholder for "no value" in contexts where a `DetailFields.*` component (which draws
 * its own empty badge) does not apply, such as table cells, editor summaries or custom inline
 * displays. Centralizes the placeholder text ({@link EMPTY_VALUE_TEXT}) and its muted styling so
 * empty rendering stays consistent.
 *
 * @example
 * ```tsx
 * {value ? <span>{value}</span> : <EmptyValue />}
 * ```
 */
export function EmptyValue({ children = EMPTY_VALUE_TEXT, className }: EmptyValueProps) {
  return <span className={className} {...slotAttributes(emptyValueStyle, {})}>{children}</span>;
}
