import type { ReactNode } from "react";

import { Flex } from "../../primitives";
import { Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import { Label } from "./label";

export interface LabeledFieldProps {
  /** Label text. Already translated by the caller. */
  label: string;
  /** Optional helper/description text below the label. Already translated by the caller. */
  description?: string;
  /** Arbitrary trailing control rendered on the right (Switch, Select, Button, ...). */
  control: ReactNode;
  /** Vertical alignment of the left column against the control. Defaults to "start". */
  align?: "start" | "center";
  /** When set, wires the label to the control via htmlFor and makes the label cursor-pointer. */
  htmlFor?: string;
  /** Extra classes merged onto the outer row. */
  className?: string;
}

/**
 * Row layout pairing a label (+ optional description) on the left with an arbitrary
 * trailing control on the right. Generalizes the SettingSwitch layout so any control
 * (Switch, Select, Button, ...) can reuse the same labelled-row presentation.
 *
 * @param props - {@link LabeledFieldProps}
 *
 * @example
 * ```tsx
 * <LabeledField
 *   label="Dark Mode"
 *   description="Use the dark color scheme"
 *   htmlFor="dark-mode"
 *   control={<Switch id="dark-mode" checked={dark} onCheckedChange={setDark} />}
 * />
 * ```
 */
export function LabeledField({
  label,
  description,
  control,
  align = "start",
  htmlFor,
  className,
}: LabeledFieldProps) {
  return (
    <Flex align={align} justify="between" gap="sm" className={className}>
      <Stack gap="none" className="flex-1 min-w-0">
        <Label
          htmlFor={htmlFor}
          className={cn("text-sm font-medium", htmlFor && "cursor-pointer")}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </Stack>
      {control}
    </Flex>
  );
}
