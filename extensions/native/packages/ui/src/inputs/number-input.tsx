import { useEffect, useState } from "react";
import type { TextInputProps } from "react-native";

import { Input } from "./input";

/** Props for the {@link NumberInput} component. */
export interface NumberInputProps
  extends Omit<TextInputProps, "value" | "onChange" | "onChangeText" | "keyboardType"> {
  value: number | null;
  onChange: (value: number | null) => void;
  /** Allow decimal input. Defaults to `true`. */
  decimal?: boolean;
  invalid?: boolean;
  className?: string;
}

/**
 * Numeric input that speaks `number | null` while tolerating in-progress
 * entry (`-`, `1.`). The numeric keyboard is selected per platform.
 */
export function NumberInput({
  value,
  onChange,
  decimal = true,
  ...rest
}: NumberInputProps) {
  const [text, setText] = useState(value == null ? "" : String(value));

  // Sync external value changes (reset, server refresh) into the draft text.
  useEffect(() => {
    const numeric = text === "" || text === "-" ? null : Number(text);
    if (numeric !== value) {
      setText(value == null ? "" : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (next: string) => {
    const pattern = decimal ? /^-?\d*(?:\.\d*)?$/ : /^-?\d*$/;
    if (!pattern.test(next)) return;
    setText(next);
    if (next === "" || next === "-" || next.endsWith(".")) {
      onChange(next === "" ? null : value);
      return;
    }
    const parsed = Number(next);
    onChange(Number.isNaN(parsed) ? null : parsed);
  };

  return (
    <Input
      value={text}
      onChangeText={handleChange}
      keyboardType={decimal ? "decimal-pad" : "number-pad"}
      {...rest}
    />
  );
}
