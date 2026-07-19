import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { Pressable, View } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Props for the {@link Checkbox} component. */
export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Tappable label rendered next to the box. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Checkbox with an optional tappable label. */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: CheckboxProps) {
  const box = (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "h-6 w-6 items-center justify-center rounded border border-input",
        checked && "border-primary bg-primary",
        disabled && "opacity-50",
        !label && className,
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Text className="text-sm font-bold text-primary-foreground">✓</Text>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return box;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn("flex-row items-center gap-2 py-1", className)}
    >
      <View pointerEvents="none">{box}</View>
      <Text size="sm" className={cn(disabled && "opacity-50")}>
        {label}
      </Text>
    </Pressable>
  );
}
