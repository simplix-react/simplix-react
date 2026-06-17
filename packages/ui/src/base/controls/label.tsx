import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { createSelfResolving } from "../../provider/self-resolving";

export type LabelProps = ComponentPropsWithRef<typeof LabelPrimitive.Root>;

export const LabelBase = forwardRef<HTMLLabelElement, LabelProps>(
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

LabelBase.displayName = "Label";

export const Label = createSelfResolving("Label", LabelBase);
