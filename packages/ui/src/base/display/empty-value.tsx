import type { ReactNode } from "react";

import { slotAttributes } from "../../design/slot-style";
import { emptyValueStyle } from "./empty-value.style";

/** Props for the {@link EmptyValue} component. */
export interface EmptyValueProps {
  /** Placeholder content; defaults to an em-dash. */
  children?: ReactNode;
  className?: string;
}

/**
 * Muted em-dash placeholder for "no value" in contexts where a `DetailFields.*`
 * component (which owns its own em-dash fallback) does not apply — e.g. table
 * cells, editor summaries, or custom inline displays. Centralizes the em-dash
 * literal and its muted styling so empty rendering stays consistent.
 *
 * @example
 * ```tsx
 * {value ? <span>{value}</span> : <EmptyValue />}
 * ```
 */
export function EmptyValue({ children = "—", className }: EmptyValueProps) {
  return <span className={className} {...slotAttributes(emptyValueStyle, {})}>{children}</span>;
}
