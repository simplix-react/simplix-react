import * as RadioGroupPrimitive from "@rn-primitives/radio-group";
import { Pressable, View } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Option entry for {@link RadioGroup}. */
export interface RadioOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/** Props for the {@link RadioGroup} component. */
export interface RadioGroupProps<T extends string = string> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: Array<RadioOption<T>>;
  /** Lay options out in a row instead of a column. */
  horizontal?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Radio option list with large touch rows. */
export function RadioGroup<T extends string = string>({
  value,
  onChange,
  options,
  horizontal,
  disabled,
  className,
}: RadioGroupProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as T)}
      disabled={disabled}
      className={cn(horizontal ? "flex-row flex-wrap gap-4" : "gap-1", className)}
    >
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !!isDisabled }}
            disabled={isDisabled}
            onPress={() => onChange(option.value)}
            className={cn("flex-row items-center gap-2 py-2", isDisabled && "opacity-50")}
          >
            <View pointerEvents="none">
              <RadioGroupPrimitive.Item
                value={option.value}
                className={cn(
                  "h-6 w-6 items-center justify-center rounded-full border border-input",
                  selected && "border-primary",
                )}
              >
                <RadioGroupPrimitive.Indicator className="h-3.5 w-3.5 rounded-full bg-primary" />
              </RadioGroupPrimitive.Item>
            </View>
            <Text size="sm">{option.label}</Text>
          </Pressable>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
