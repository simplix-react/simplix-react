import {
  type FormEvent,
  type ReactNode,
  useCallback,
} from "react";

import { Flex } from "../../primitives/flex";
import { Grid } from "../../primitives/grid";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { XIcon } from "../shared/icons";
import type { SectionShellProps } from "../shared/section-shell";
import { type FieldVariant, FieldVariantContext } from "../shared/types";
import { useBeforeUnload } from "./use-before-unload";

// ── Form Root ──

/**
 * Props for the {@link CrudForm} compound component root.
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │  header                       [X]   │
 * ├─────────────────────────────────────┤
 * │  Section: "Basic Info"              │
 * │  ┌───────────┐ ┌───────────┐       │
 * │  │ [Name...] │ │ [Email..] │       │
 * │  └───────────┘ └───────────┘       │
 * │  Section: "Settings"               │
 * │  ┌───────────────────────┐         │
 * │  │ [Timezone ▼]          │         │
 * │  └───────────────────────┘         │
 * ├─────────────────────────────────────┤
 * │  footer: [Cancel]  [Save]          │
 * └─────────────────────────────────────┘
 * ```
 */
export interface CrudFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** Renders a close button (panel-right-close icon) at the right side of the header toolbar. */
  onClose?: () => void;
  /** Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label). */
  header?: ReactNode;
  /** Fixed footer rendered below the scrollable content (e.g. action buttons). */
  footer?: ReactNode;
  /** When true, indicates form is being submitted. Propagated via `data-submitting` attribute. */
  isSubmitting?: boolean;
  /**
   * Layout context. `"panel"` (default) fills its host, scrolls its own body,
   * and pads header/body/footer edges for the panel scrollbar. `"page"` flows
   * with the document — the page owns the scroll and no horizontal inset is
   * added, so sections align with surrounding page content.
   */
  variant?: "panel" | "page";
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
  isSubmitting,
  variant = "panel",
  fieldVariant,
  warnOnUnsavedChanges,
  className,
  children,
}: CrudFormProps) {
  const { Button } = useFlatUIComponents();
  useBeforeUnload(!!warnOnUnsavedChanges);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit],
  );

  const isPage = variant === "page";

  const content = (
    <form onSubmit={handleSubmit} className={cn("flex flex-col w-full", !isPage && "flex-1 min-h-0", className)} data-testid="crud-form" data-submitting={isSubmitting || undefined}>
      {(onClose || header) && (
        <Flex data-crud-slot="header" justify={header ? "between" : "end"} align="center" className={cn("shrink-0 border-b pb-2", !isPage && "px-3")}>
          {header}
          {onClose && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </Flex>
      )}
      {/* Panel variant: horizontal padding keeps a visible gap between fields
          and the body scrollbar; header/body/footer share it so their edges
          stay aligned. Page variant: the document owns the scroll, so the body
          neither scrolls nor insets. */}
      <div data-crud-slot="body" className={cn(!isPage && "flex-1 min-h-0 overflow-auto [scrollbar-gutter:stable] px-3")}>
        <Stack gap="sm" className={cn("relative py-2", !(onClose || header) && "pt-2")}>
          {children}
        </Stack>
      </div>
      {footer && (
        <div data-crud-slot="footer" className={cn("shrink-0", !isPage && "px-3")}>{footer}</div>
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
  const { SectionShell } = useFlatUIComponents();
  const columns = layoutClasses[layout];

  return (
    <SectionShell {...props}>
      <Grid columns={columns} gap="sm">
        {props.children}
      </Grid>
    </SectionShell>
  );
}

// ── Form.Actions ──

/** Props for the CrudForm.Actions sub-component. */
export interface CrudFormActionsProps {
  /** When true, uses justify-between (e.g. back button on left, save on right). Defaults to justify-end. */
  spread?: boolean;
  className?: string;
  children?: ReactNode;
}

function FormActions({ spread, className, children }: CrudFormActionsProps) {
  return (
    <Flex gap="sm" justify={spread ? "between" : "end"} className={cn("border-t pt-2", className)}>
      {children}
    </Flex>
  );
}

// ── Compound component assembly ──

/**
 * Compound component for building CRUD create/edit form layouts.
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │  header                       [X]   │
 * ├─────────────────────────────────────┤
 * │  <CrudForm.Section>                 │
 * │    form fields (Grid layout)        │
 * │  </CrudForm.Section>               │
 * ├─────────────────────────────────────┤
 * │  <CrudForm.Actions>                 │
 * │              [Cancel]  [Save]       │
 * └─────────────────────────────────────┘
 * ```
 *
 * Sub-components: Section (with layout variants), Actions.
 */
export const CrudForm = Object.assign(FormRoot, {
  Section: FormSection,
  Actions: FormActions,
});
