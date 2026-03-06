import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";

export interface NumberInputProps extends Omit<ComponentPropsWithRef<"input">, "type" | "onChange"> {
  onChange?: (value: number) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, onChange, ...rest }, ref) => (
    <input
      ref={ref}
      type="number"
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        if (Number.isNaN(v)) return;
        const minVal = typeof min === "number" ? min : -Infinity;
        const maxVal = typeof max === "number" ? max : Infinity;
        onChange?.(Math.min(maxVal, Math.max(minVal, v)));
      }}
      className={cn(
        "flex h-8 w-full rounded-md border border-input bg-background px-1.5 py-1.5 text-sm text-center placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  ),
);

NumberInput.displayName = "NumberInput";
