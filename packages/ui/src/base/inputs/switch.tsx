import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithRef, forwardRef } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { slotAttributes, slotClassNames } from "../../design/slot-style";
import { switchStyle, switchThumbStyle } from "./switch.style";
import { createSelfResolving } from "../../provider/self-resolving";

export const switchVariants = slotClassNames(switchStyle);

export type SwitchProps = ComponentPropsWithRef<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

export const SwitchBase = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size, ...rest }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn("peer", className)}
      {...rest}
      {...slotAttributes(switchStyle, { size })}
    >
      <SwitchPrimitive.Thumb {...slotAttributes(switchThumbStyle, { size })} />
    </SwitchPrimitive.Root>
  ),
);

SwitchBase.displayName = "Switch";

export const Switch = createSelfResolving("Switch", SwitchBase);
