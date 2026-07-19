import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Props for the {@link ScrollBox} component. */
export interface ScrollBoxProps {
  /** Maximum height in CSS pixels before the content scrolls; defaults to 288. */
  maxHeight?: number;
  /** Preserve whitespace/line breaks (long agreement bodies); defaults to true. */
  preserveWhitespace?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Bounded scroll container for long read-through content (agreement bodies,
 * terms, logs): a bordered box that scrolls its own overflow instead of
 * stretching the page. Centralizes the max-height + overflow pattern so
 * call sites stop re-implementing it with raw divs.
 *
 * @example
 * ```tsx
 * <ScrollBox maxHeight={320}>{agreement.content}</ScrollBox>
 * ```
 */
export function ScrollBox({
  maxHeight = 288,
  preserveWhitespace = true,
  className,
  children,
}: ScrollBoxProps) {
  return (
    <div
      className={cn(
        "overflow-y-auto rounded-md border p-3 text-sm",
        preserveWhitespace && "whitespace-pre-wrap",
        className,
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
