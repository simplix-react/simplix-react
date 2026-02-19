import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

export type LabelProps = ComponentPropsWithRef<typeof LabelPrimitive.Root>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...rest }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...rest}
    />
  ),
);

Label.displayName = "Label";
