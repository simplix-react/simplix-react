import { Badge } from "./badge";
import type { BadgeVariants } from "./badge";
import { cn } from "../../utils/cn";
import { CheckIcon, XIcon } from "../../crud/shared/icons";

export interface BooleanBadgeProps {
  value: boolean | null | undefined;
  trueVariant?: BadgeVariants["variant"];
  falseVariant?: BadgeVariants["variant"];
  /** Accessible name for the true state (default "yes"). */
  trueLabel?: string;
  /** Accessible name for the false state (default "no"). */
  falseLabel?: string;
  className?: string;
}

export function BooleanBadge({
  value,
  trueVariant = "success",
  falseVariant = "outline",
  trueLabel = "yes",
  falseLabel = "no",
  className,
}: BooleanBadgeProps) {
  const isTrue = !!value;
  const variant = isTrue ? trueVariant : falseVariant;
  const Icon = isTrue ? CheckIcon : XIcon;

  return (
    <Badge
      variant={variant}
      className={cn("px-1.5", className)}
      aria-label={isTrue ? trueLabel : falseLabel}
      // Opt out of the list-cell uniform-width rule ([data-slot=badge]); a
      // boolean indicator is a compact icon pill, not a labeled status pill.
      data-slot="boolean-badge"
    >
      <Icon className="size-3" aria-hidden />
    </Badge>
  );
}
