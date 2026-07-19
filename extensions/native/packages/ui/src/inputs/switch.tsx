import * as SwitchPrimitive from "@rn-primitives/switch";

import { cn } from "../utils/cn";

/** Props for the {@link Switch} component. */
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Toggle switch bound to the theme tokens. */
export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "h-7 w-12 justify-center rounded-full px-0.5",
        checked ? "bg-primary" : "bg-surface-3",
        disabled && "opacity-50",
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "h-6 w-6 rounded-full bg-background shadow-sm",
          checked && "self-end",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
