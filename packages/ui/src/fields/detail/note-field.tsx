import { cn } from "../../utils/cn";

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
    <p className={cn("rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground whitespace-pre-wrap", className)}>
      {displayValue}
    </p>
  );
}
