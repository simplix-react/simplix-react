import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "../utils/cn";
import { Heading } from "./heading";
import { Stack } from "./stack";
import { Text } from "./text";

/** Props for the {@link Section} layout component. */
export interface SectionProps extends Omit<ViewProps, "children"> {
  /** Section heading. */
  title?: string;
  /** Descriptive text rendered below the title. */
  description?: string;
  children?: ReactNode;
}

/**
 * Section container with optional title and description — the same prop
 * language as the web `Section`.
 *
 * @example
 * ```tsx
 * <Section title="Account Settings" description="Manage your account preferences">
 *   <FormFields.TextField label="Display Name" value={name} onChange={setName} />
 * </Section>
 * ```
 */
export function Section({ className, title, description, children, ...rest }: SectionProps) {
  return (
    <View className={cn("gap-4", className)} {...rest}>
      {(title || description) && (
        <Stack gap="xs">
          {title ? <Heading level={5}>{title}</Heading> : null}
          {description ? (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          ) : null}
        </Stack>
      )}
      {children}
    </View>
  );
}
