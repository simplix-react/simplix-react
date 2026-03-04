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
import { useUIComponents } from "../../provider/ui-provider";
import { XIcon } from "../shared/icons";
import type { SectionShellProps } from "../shared/section-shell";
import { type FieldVariant, FieldVariantContext } from "../shared/types";

// ── Form Root ──

/** Props for the {@link CrudForm} compound component root. */
export interface CrudFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** Renders a close button (panel-right-close icon) at the right side of the header toolbar. */
  onClose?: () => void;
  /** Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label). */
  header?: ReactNode;
  /** Fixed footer rendered below the scrollable content (e.g. action buttons). */
  footer?: ReactNode;
  fieldVariant?: FieldVariant;
  warnOnUnsavedChanges?: boolean;
  className?: string;
  children?: ReactNode;
}

function FormRoot({
  onSubmit,
  onClose,
  header,
  footer,
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
    <form onSubmit={handleSubmit} className={cn("flex flex-col w-full flex-1 min-h-0", className)} data-testid="crud-form">
      {(onClose || header) && (
        <Flex justify={header ? "between" : "end"} align="center" className="shrink-0 border-b pb-2 px-2">
          {header}
          {onClose && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </Flex>
      )}
      <div className="min-h-0 overflow-auto [scrollbar-gutter:stable]">
        <Stack gap="sm" className={cn("relative py-2", !(onClose || header) && "pt-2")}>
          {children}
        </Stack>
      </div>
      {footer && (
        <div className="shrink-0 mt-2">{footer}</div>
      )}
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

/**
 * Section sub-component for CrudForm.
 *
 * @example Icon in title
 * ```tsx
 * <CrudForm.Section title={<><UserIcon className="size-4" /> Account</>} variant="flat">
 *   ...
 * </CrudForm.Section>
 * ```
 *
 * @example Trailing content
 * ```tsx
 * <CrudForm.Section title="Settings" trailing={<Badge variant="outline">Optional</Badge>}>
 *   ...
 * </CrudForm.Section>
 * ```
 */
export interface CrudFormSectionProps extends SectionShellProps {
  layout?: keyof typeof layoutClasses;
}

function FormSection({
  layout = "single-column",
  ...props
}: CrudFormSectionProps) {
  const { SectionShell } = useUIComponents();
  const columns = layoutClasses[layout];

  return (
    <SectionShell {...props}>
      <Grid columns={columns} gap="md">
        {props.children}
      </Grid>
    </SectionShell>
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
    <Flex gap="sm" justify="end" className={cn("border-t pt-2 px-2", className)}>
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
