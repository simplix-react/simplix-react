import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { createSelfResolving } from "../../provider/self-resolving";
import { slotAttributes } from "../../design/slot-style";
import { inputStyle } from "./input.style";

export type InputProps = ComponentPropsWithRef<"input">;

export const InputBase = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn("flex h-8 w-full", className)}
      {...rest}
      {...slotAttributes(inputStyle, {})}
    />
  ),
);

InputBase.displayName = "Input";

export const Input = createSelfResolving("Input", InputBase);
