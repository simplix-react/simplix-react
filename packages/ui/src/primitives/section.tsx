import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";

import { slotAttributes } from "../design/slot-style";
import { sectionDescriptionStyle, sectionStyle, sectionTitleStyle } from "./section.style";
import { Stack } from "./stack";

/** Props for the {@link Section} layout component. */
export interface SectionProps
  extends Omit<ComponentPropsWithRef<"section">, "title"> {
  /** Section heading rendered as an h3 element. */
  title?: ReactNode;
  /** Descriptive text rendered below the title. */
  description?: string;
  children?: ReactNode;
}

/**
 * Semantic section container with optional title and description.
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │ Account Settings                    │
 * │ Manage your account preferences     │
 * │                                     │
 * │ ┌─────────────────────────────────┐ │
 * │ │  children...                    │ │
 * │ └─────────────────────────────────┘ │
 * └─────────────────────────────────────┘
 * ```
 *
 * @param props - {@link SectionProps}
 *
 * @example
 * ```tsx
 * <Section title="Account Settings" description="Manage your account preferences">
 *   <TextField label="Display Name" value={name} onChange={setName} />
 * </Section>
 * ```
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, title, description, children, ...rest }, ref) => (
    <section ref={ref} className={className} {...rest} {...slotAttributes(sectionStyle, {})}>
      {(title || description) && (
        <Stack gap="xs">
          {title && (
            <h3 {...slotAttributes(sectionTitleStyle, {})}>{title}</h3>
          )}
          {description && (
            <p {...slotAttributes(sectionDescriptionStyle, {})}>{description}</p>
          )}
        </Stack>
      )}
      {children}
    </section>
  ),
);
Section.displayName = "Section";
