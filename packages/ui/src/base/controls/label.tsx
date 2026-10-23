import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { slotAttributes } from "../../design/slot-style";
import { labelStyle } from "./label.style";
import { createSelfResolving } from "../../provider/self-resolving";

export type LabelProps = ComponentPropsWithRef<typeof LabelPrimitive.Root>;

export const LabelBase = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...rest }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn("peer-disabled:cursor-not-allowed", className)}
      {...rest}
      {...slotAttributes(labelStyle, {})}
    />
  ),
);

LabelBase.displayName = "Label";

export const Label = createSelfResolving("Label", LabelBase);
