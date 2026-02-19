import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

export type SeparatorProps = ComponentPropsWithRef<
  typeof SeparatorPrimitive.Root
>;

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...rest },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...rest}
    />
  ),
);

Separator.displayName = "Separator";
