import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { createSelfResolving } from "../../provider/self-resolving";
import { slotAttributes } from "../../design/slot-style";
import { textareaStyle } from "./textarea.style";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

export const TextareaBase = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn("flex min-h-16 w-full", className)}
      {...rest}
      {...slotAttributes(textareaStyle, {})}
    />
  ),
);

TextareaBase.displayName = "Textarea";

export const Textarea = createSelfResolving("Textarea", TextareaBase);
