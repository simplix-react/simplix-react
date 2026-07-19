import * as LabelPrimitive from "@rn-primitives/label";
import type { ReactNode } from "react";

import { cn } from "../utils/cn";

/** Props for the {@link Label} component. */
export interface LabelProps extends Omit<LabelPrimitive.TextProps, "children"> {
  children?: ReactNode;
  className?: string;
}

/** Form label text bound to the field typography scale. */
export function Label({ className, children, ...rest }: LabelProps) {
  return (
    <LabelPrimitive.Root>
      <LabelPrimitive.Text
        className={cn("text-sm font-medium text-foreground", className)}
        {...rest}
      >
        {children}
      </LabelPrimitive.Text>
    </LabelPrimitive.Root>
  );
}
