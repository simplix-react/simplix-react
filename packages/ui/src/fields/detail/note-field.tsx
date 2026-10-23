import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { detailNoteFieldStyle } from "./note-field.style";

/** Props for the {@link DetailNoteField} component. */
export interface DetailNoteFieldProps {
  /** Text value to display. */
  value: string | null | undefined;
  /** Fallback text when value is null/undefined. */
  fallback?: string;
  className?: string;
}

/**
 * Label-less card for displaying description or note text
 * with a subtle background.
 *
 * @example
 * ```tsx
 * <DetailNoteField value={data.description} />
 * ```
 */
export function DetailNoteField({ value, fallback, className }: DetailNoteFieldProps) {
  const displayValue = value ?? fallback;
  if (!displayValue) return null;

  return (
    <p className={cn("whitespace-pre-wrap", className)} {...slotAttributes(detailNoteFieldStyle, {})}>
      {displayValue}
    </p>
  );
}
