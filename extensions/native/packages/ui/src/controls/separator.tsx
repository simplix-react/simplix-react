import * as SeparatorPrimitive from "@rn-primitives/separator";

import { cn } from "../utils/cn";

/** Props for the {@link Separator} component. */
export interface SeparatorProps extends SeparatorPrimitive.RootProps {
  className?: string;
}

/** Thin divider line, horizontal by default. */
export function Separator({
  className,
  orientation = "horizontal",
  ...rest
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}
