import { TextInput, type TextInputProps } from "react-native";

import { cn } from "../utils/cn";
import { usePlaceholderColor } from "./input";

/** Props for the {@link Textarea} component. */
export interface TextareaProps extends TextInputProps {
  /** Renders the error border treatment. */
  invalid?: boolean;
  className?: string;
}

/** Multi-line text input bound to the theme tokens. */
export function Textarea({ className, invalid, editable, ...rest }: TextareaProps) {
  const placeholderColor = usePlaceholderColor();

  return (
    <TextInput
      multiline
      textAlignVertical="top"
      editable={editable}
      placeholderTextColor={placeholderColor}
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground",
        invalid && "border-destructive",
        editable === false && "opacity-50",
        className,
      )}
      {...rest}
    />
  );
}
