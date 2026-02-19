import type { ComponentType } from "react";

import type { BadgeProps } from "../base/badge";
import type { CalendarProps } from "../base/calendar";
import type { CheckboxProps } from "../base/checkbox";
import type { InputProps } from "../base/input";
import type { LabelProps } from "../base/label";
import type { RadioGroupItemProps, RadioGroupProps } from "../base/radio-group";
import type {
  SelectContentProps,
  SelectItemProps,
  SelectTriggerProps,
} from "../base/select";
import type { SwitchProps } from "../base/switch";
import type { TextareaProps } from "../base/textarea";
import type { CardProps } from "../primitives/card";
import type { ContainerProps } from "../primitives/container";
import type { FlexProps } from "../primitives/flex";
import type { GridProps } from "../primitives/grid";
import type { HeadingProps } from "../primitives/heading";
import type { SectionProps } from "../primitives/section";
import type { StackProps } from "../primitives/stack";
import type { TextProps } from "../primitives/text";

export interface SelectComponents {
  Root: ComponentType<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string; disabled?: boolean }>;
  Trigger: ComponentType<SelectTriggerProps>;
  Value: ComponentType<{ placeholder?: string }>;
  Content: ComponentType<SelectContentProps>;
  Item: ComponentType<SelectItemProps>;
}

export interface RadioGroupComponents {
  Root: ComponentType<RadioGroupProps>;
  Item: ComponentType<RadioGroupItemProps>;
}

export interface UIComponents {
  // Base components
  Input: ComponentType<InputProps>;
  Textarea: ComponentType<TextareaProps>;
  Label: ComponentType<LabelProps>;
  Switch: ComponentType<SwitchProps>;
  Checkbox: ComponentType<CheckboxProps>;
  Badge: ComponentType<BadgeProps>;
  Calendar: ComponentType<CalendarProps>;
  Select: SelectComponents;
  RadioGroup: RadioGroupComponents;
  // Primitives
  Container: ComponentType<ContainerProps>;
  Stack: ComponentType<StackProps>;
  Flex: ComponentType<FlexProps>;
  Grid: ComponentType<GridProps>;
  Heading: ComponentType<HeadingProps>;
  Text: ComponentType<TextProps>;
  Card: ComponentType<CardProps>;
  Section: ComponentType<SectionProps>;
}
