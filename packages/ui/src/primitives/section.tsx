import { type ComponentPropsWithRef, forwardRef, type ReactNode, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";
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
 * Semantic section with optional title and description.
 *
 * @example
 * ```tsx
 * <Section title="Account Settings" description="Manage your account preferences">
 *   <TextField label="Display Name" value={name} onChange={setName} />
 * </Section>
 * ```
 */
const SectionBase = forwardRef<HTMLElement, SectionProps>(
  ({ className, title, description, children, ...rest }, ref) => (
    <section ref={ref} className={cn("space-y-4", className)} {...rest}>
      {(title || description) && (
        <Stack gap="xs">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </Stack>
      )}
      {children}
    </section>
  ),
);
SectionBase.displayName = "Section";

export const Section = forwardRef<HTMLElement, SectionProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Section) {
      return <ctx.Section {...props} />;
    }
    return <SectionBase ref={ref} {...props} />;
  },
);
Section.displayName = "Section";
