import type { ReactNode } from "react";

import { Button } from "../../base/button";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { PanelRightCloseIcon, TrashIcon } from "../shared/icons";
import { type FieldVariant, FieldVariantContext } from "../shared/types";

// ── Detail Root ──

/** Props for the {@link CrudDetail} compound component root. */
export interface CrudDetailProps {
  /** Shows a semi-transparent overlay with a spinner on top of the detail content. */
  isLoading?: boolean;
  /** Renders a close button (panel-right-close icon) at the right side of the header toolbar. */
  onClose?: () => void;
  /** Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label). */
  header?: ReactNode;
  fieldVariant?: FieldVariant;
  className?: string;
  children?: ReactNode;
}

function DetailRoot({ isLoading, onClose, header, fieldVariant, className, children }: CrudDetailProps) {
  const content = (
    <Stack gap="lg" className={cn("relative w-full px-1", className)} data-testid="crud-detail">
      {isLoading && (
        <output
          aria-busy="true"
          aria-label="Loading"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 animate-in fade-in-0 duration-150"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </output>
      )}
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

// ── Detail.Section ──

/** Props for the CrudDetail.Section sub-component. */
export interface CrudDetailSectionProps {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

function DetailSection({ title, description, className, children }: CrudDetailSectionProps) {
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
        <Stack gap="sm">
          {children}
        </Stack>
      </Stack>
    </section>
  );
}

// ── Detail.Actions ──

/** Props for the CrudDetail.Actions sub-component. */
export interface CrudDetailActionsProps {
  className?: string;
  children?: ReactNode;
}

function DetailActions({ className, children }: CrudDetailActionsProps) {
  return (
    <Flex gap="sm" className={cn("border-t pt-4", className)}>
      {children}
    </Flex>
  );
}

// ── Detail.DefaultActions ──

/** Props for the CrudDetail.DefaultActions sub-component. */
export interface CrudDetailDefaultActionsProps {
  onClose?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  /** Label for the close button (defaults to `"Close"`). */
  closeLabel?: string;
  /** Label for the edit button (defaults to `"Edit"`). */
  editLabel?: string;
  className?: string;
}

function DetailDefaultActions({ onClose, onDelete, onEdit, closeLabel = "Close", editLabel = "Edit", className }: CrudDetailDefaultActionsProps) {
  return (
    <DetailActions className={cn(onClose ? "justify-between" : "justify-end", className)}>
      {onClose && (
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {closeLabel}
        </Button>
      )}
      <Flex gap="sm">
        {onDelete && (
          <Button type="button" size="icon-sm" variant="outline" onClick={onDelete}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button type="button" size="sm" variant="primary" onClick={onEdit}>
            {editLabel}
          </Button>
        )}
      </Flex>
    </DetailActions>
  );
}

// ── Compound component assembly ──

/**
 * Compound component for building read-only CRUD detail views.
 *
 * Sub-components: Section, Actions, DefaultActions.
 */
export const CrudDetail = Object.assign(DetailRoot, {
  Section: DetailSection,
  Actions: DetailActions,
  DefaultActions: DetailDefaultActions,
});
