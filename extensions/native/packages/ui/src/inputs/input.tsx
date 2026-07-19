import { TextInput, type TextInputProps } from "react-native";

import { useSimplixTheme } from "../theme/theme-provider";
import { cn } from "../utils/cn";

/** Props for the {@link Input} component. */
export interface InputProps extends TextInputProps {
  /** Renders the error border treatment. */
  invalid?: boolean;
  className?: string;
}

/** Placeholder color resolved from the active theme tokens. */
export function usePlaceholderColor(): string {
  const { tokens } = useSimplixTheme();
  return tokens["--muted-foreground"] ?? "#62748e";
}

/** Single-line text input bound to the theme tokens. */
export function Input({ className, invalid, editable, ...rest }: InputProps) {
  const placeholderColor = usePlaceholderColor();

  return (
    <TextInput
      editable={editable}
      placeholderTextColor={placeholderColor}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground",
        invalid && "border-destructive",
        editable === false && "opacity-50",
        className,
      )}
      {...rest}
    />
  );
}
