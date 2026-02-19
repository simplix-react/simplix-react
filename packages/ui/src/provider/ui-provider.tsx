import { type ReactNode, useContext, useMemo } from "react";

import { Badge } from "../base/badge";
import { Calendar } from "../base/calendar";
import { Checkbox } from "../base/checkbox";
import { Input } from "../base/input";
import { Label } from "../base/label";
import { RadioGroup, RadioGroupItem } from "../base/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../base/select";
import { Switch } from "../base/switch";
import { Textarea } from "../base/textarea";
import { Card } from "../primitives/card";
import { Container } from "../primitives/container";
import { Flex } from "../primitives/flex";
import { Grid } from "../primitives/grid";
import { Heading } from "../primitives/heading";
import { Section } from "../primitives/section";
import { Stack } from "../primitives/stack";
import { Text } from "../primitives/text";
import type { UIComponents } from "./types";
import { UIComponentContext } from "./ui-component-context";

const defaultComponents: UIComponents = {
  Input,
  Textarea,
  Label,
  Switch,
  Checkbox,
  Badge,
  Calendar,
  Select: {
    Root: Select,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Content: SelectContent,
    Item: SelectItem,
  },
  RadioGroup: {
    Root: RadioGroup,
    Item: RadioGroupItem,
  },
  Container,
  Stack,
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  Section,
};

/** Props for the {@link UIProvider} component. */
export interface UIProviderProps {
  /** Partial overrides for default base and primitive components. */
  overrides?: Partial<UIComponents>;
  children: ReactNode;
}

/**
 * Provides overridable base component implementations to the component tree.
 * Supports nesting for scoped overrides.
 *
 * @example
 * ```tsx
 * <UIProvider overrides={{ Input: MyCustomInput }}>
 *   <FormFields.TextField label="Name" value={v} onChange={setV} />
 * </UIProvider>
 * ```
 */
export function UIProvider({ overrides, children }: UIProviderProps) {
  const parent = useContext(UIComponentContext);

  const merged = useMemo(
    () => ({ ...parent, ...overrides }),
    [parent, overrides],
  );

  return (
    <UIComponentContext.Provider value={merged}>
      {children}
    </UIComponentContext.Provider>
  );
}

/**
 * Returns the resolved set of UI base components, merging defaults with
 * any overrides provided by ancestor {@link UIProvider} instances.
 */
export function useUIComponents(): UIComponents {
  const overrides = useContext(UIComponentContext);

  return useMemo(
    () => ({
      ...defaultComponents,
      ...overrides,
      Select: {
        ...defaultComponents.Select,
        ...overrides.Select,
      },
      RadioGroup: {
        ...defaultComponents.RadioGroup,
        ...overrides.RadioGroup,
      },
    }),
    [overrides],
  );
}
