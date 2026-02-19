import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
} from "react";

import { Button } from "../../base/button";
import { Flex } from "../../primitives/flex";
import { Grid } from "../../primitives/grid";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { PanelRightCloseIcon } from "../shared/icons";
import { type FieldVariant, FieldVariantContext } from "../shared/types";

// ── Form Root ──

/** Props for the {@link CrudForm} compound component root. */
export interface CrudFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** Renders a close button (panel-right-close icon) at the right side of the header toolbar. */
  onClose?: () => void;
  /** Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label). */
  header?: ReactNode;
  fieldVariant?: FieldVariant;
  warnOnUnsavedChanges?: boolean;
  className?: string;
  children?: ReactNode;
}

function FormRoot({
  onSubmit,
  onClose,
  header,
  fieldVariant,
  warnOnUnsavedChanges,
  className,
  children,
}: CrudFormProps) {
  // Warn about unsaved changes via beforeunload
  useEffect(() => {
    if (!warnOnUnsavedChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [warnOnUnsavedChanges]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit],
  );

  const content = (
    <form onSubmit={handleSubmit} className={cn("w-full px-1", className)} data-testid="crud-form">
      <Stack gap="lg">
        {(onClose || header) && (
          <Flex justify={header ? "between" : "end"} align="center" className="border-b pb-4">
            {header}
            {onClose && (
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <PanelRightCloseIcon className="h-4 w-4" />
              </Button>
            )}
          </Flex>
        )}
        {children}
      </Stack>
    </form>
  );

  if (fieldVariant) {
    return (
      <FieldVariantContext.Provider value={fieldVariant}>
        {content}
      </FieldVariantContext.Provider>
    );
  }

  return content;
}

// ── Form.Section ──

const layoutClasses = {
  "single-column": 1,
  "two-column": 2,
  "three-column": 3,
} as const;

/** Props for the CrudForm.Section sub-component. */
export interface CrudFormSectionProps {
  title: string;
  description?: string;
  layout?: keyof typeof layoutClasses;
  className?: string;
  children?: ReactNode;
}

function FormSection({
  title,
  description,
  layout = "single-column",
  className,
  children,
}: CrudFormSectionProps) {
  const columns = layoutClasses[layout];

  return (
    <section
      className={cn(
        "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </Stack>
        <Grid columns={columns} gap="md">
          {children}
        </Grid>
      </Stack>
    </section>
  );
}

// ── Form.Actions ──

/** Props for the CrudForm.Actions sub-component. */
export interface CrudFormActionsProps {
  className?: string;
  children?: ReactNode;
}

function FormActions({ className, children }: CrudFormActionsProps) {
  return (
    <Flex gap="sm" justify="end" className={cn("border-t pt-4", className)}>
      {children}
    </Flex>
  );
}

// ── Compound component assembly ──

/**
 * Compound component for building CRUD form layouts with sections and actions.
 *
 * Sub-components: Section (with layout variants), Actions.
 */
export const CrudForm = Object.assign(FormRoot, {
  Section: FormSection,
  Actions: FormActions,
});
