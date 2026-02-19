import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

export type RadioGroupProps = ComponentPropsWithRef<
  typeof RadioGroupPrimitive.Root
>;

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...rest }, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("grid gap-2", className)}
      {...rest}
    />
  ),
);

RadioGroup.displayName = "RadioGroup";

export type RadioGroupItemProps = ComponentPropsWithRef<
  typeof RadioGroupPrimitive.Item
>;

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, ...rest }, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
        >
          <circle cx="7.5" cy="7.5" r="3.5" fill="currentColor" />
        </svg>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  ),
);

RadioGroupItem.displayName = "RadioGroupItem";
