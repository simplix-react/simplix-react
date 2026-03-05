import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils/cn";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        default: "h-6 w-11",
        sm: "h-4 w-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        default: "h-5 w-5 data-[state=checked]:translate-x-5",
        sm: "h-3 w-3 data-[state=checked]:translate-x-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type SwitchProps = ComponentPropsWithRef<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size, ...rest }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(switchVariants({ size }), className)}
      {...rest}
    >
      <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
    </SwitchPrimitive.Root>
  ),
);

Switch.displayName = "Switch";
