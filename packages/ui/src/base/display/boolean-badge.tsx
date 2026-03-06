import { Badge } from "./badge";
import type { BadgeVariants } from "./badge";
import { cn } from "../../utils/cn";
import { CheckIcon, XIcon } from "../../crud/shared/icons";

export interface BooleanBadgeProps {
  value: boolean | null | undefined;
  trueVariant?: BadgeVariants["variant"];
  falseVariant?: BadgeVariants["variant"];
  className?: string;
}

export function BooleanBadge({
  value,
  trueVariant = "success",
  falseVariant = "outline",
  className,
}: BooleanBadgeProps) {
  const isTrue = !!value;
  const variant = isTrue ? trueVariant : falseVariant;
  const Icon = isTrue ? CheckIcon : XIcon;

  return (
    <Badge variant={variant} className={cn("px-1.5", className)}>
      <Icon className="size-3" />
    </Badge>
  );
}
