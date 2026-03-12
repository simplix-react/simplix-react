import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

import { Button } from "../../base/controls/button";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { useUIComponents } from "../../provider/ui-provider";
import { ArrowLeftIcon, XIcon, TrashIcon } from "../shared/icons";
import type { SectionShellProps } from "../shared/section-shell";
import { type FieldVariant, FieldVariantContext } from "../shared/types";
import { DetailAuditFooter, type AuditData } from "./crud-detail-audit-footer";

// ── Detail Root ──
//
// ┌─────────────────────────────────────┐
// │ DetailRoot  (flex col, min-h-0)     │
// │                                     │
// │ ┌─────────────────────────────────┐ │
// │ │ Header toolbar  (shrink-0)      │ │
// │ │ ┌──────────┐        ┌────────┐  │ │
// │ │ │  header  │        │ [X]    │  │ │
// │ │ └──────────┘        └────────┘  │ │
// │ └─────────────────────────────────┘ │
// │ ┌─────────────────────────────────┐ │
// │ │ Scrollable area  (overflow-auto)│ │
// │ │ ┌─────────────────────────────┐ │ │
// │ │ │ Stack (gap-sm, relative)    │ │ │
// │ │ │                             │ │ │
// │ │ │  ┌───────────────────────┐  │ │ │
// │ │ │  │ Loading overlay (z-10)│  │ │ │
// │ │ │  │      [spinner]        │  │ │ │
// │ │ │  └───────────────────────┘  │ │ │
// │ │ │                             │ │ │
// │ │ │  {children}                 │ │ │
// │ │ │   ├─ Section                │ │ │
// │ │ │   ├─ Section                │ │ │
// │ │ │   └─ ...                    │ │ │
// │ │ └─────────────────────────────┘ │ │
// │ └─────────────────────────────────┘ │
// │ ┌─────────────────────────────────┐ │
// │ │ AuditFooter  (shrink-0)        │ │
// │ │  [ID] abc..   Created Modified │ │
// │ └─────────────────────────────────┘ │
// │ ┌─────────────────────────────────┐ │
// │ │ Footer  (shrink-0)              │ │
// │ │  e.g. DefaultActions            │ │
// │ └─────────────────────────────────┘ │
// └─────────────────────────────────────┘

/** Layout variant for {@link CrudDetail}. */
export type CrudDetailVariant = "default" | "dialog";

/**
 * Props for the {@link CrudDetail} compound component root.
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │  header                       [X]   │
 * ├─────────────────────────────────────┤
 * │  Section: "Basic Info"              │
 * │  Name:    Pet A                     │
 * │  Status:  Active                    │
 * │                                     │
 * │  Section: "Location"               │
 * │  Address: 123 Main St              │
 * │           [loading overlay...]      │
 * ├─────────────────────────────────────┤
 * │  [← Back]        [Delete] [Edit]   │
 * └─────────────────────────────────────┘
 * ```
 */
export interface CrudDetailProps {
  /** Shows a semi-transparent overlay with a spinner on top of the detail content. */
  isLoading?: boolean;
  /** Renders a close button (panel-right-close icon) at the right side of the header toolbar. */
  onClose?: () => void;
  /** Content rendered at the left side of the header toolbar (e.g. breadcrumb, back button, label). */
  header?: ReactNode;
  /** Fixed footer rendered below the scrollable content (e.g. action buttons). */
  footer?: ReactNode;
  /**
   * Layout variant.
   * - `"default"` — compact padding for side panels (px-2).
   * - `"dialog"` — generous padding for use inside Dialog (px-5, extra vertical padding on header/footer).
   */
  variant?: CrudDetailVariant;
  /** Audit metadata rendered as a fixed bar between the scrollable body and the footer. */
  auditData?: AuditData;
  fieldVariant?: FieldVariant;
  className?: string;
  children?: ReactNode;
}

function DetailRoot({ isLoading, onClose, header, footer, variant = "default", auditData, fieldVariant, className, children }: CrudDetailProps) {
  const isDialog = variant === "dialog";
  const px = isDialog ? "px-5" : "px-2";

  const content = (
    <div className={cn("flex flex-col flex-1 min-h-0 w-full", className)} data-testid="crud-detail">
      {(onClose || header) && (
        <Flex data-crud-slot="header" justify={header ? "between" : "end"} align="center" className={cn("shrink-0 border-b pb-2", px, isDialog && "pt-3")}>
          {header}
          {onClose && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </Flex>
      )}
      <div data-crud-slot="body" className={cn("flex-1 min-h-0 overflow-auto [scrollbar-gutter:stable]", px)}>
        <Stack gap="sm" className={cn("relative py-2", !(onClose || header) && "pt-2")}>
          {isLoading && (
            <output
              aria-busy="true"
              aria-label="Loading"
              className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 animate-in fade-in-0 duration-150"
            >
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </output>
          )}
          {children}
        </Stack>
        {auditData && (
          <div data-crud-slot="audit" className="sticky bottom-0 pb-2 bg-background">
            <DetailAuditFooter auditData={auditData} />
          </div>
        )}
      </div>
      {footer && (
        <div data-crud-slot="footer" className={cn("shrink-0", px, isDialog && "pb-3")}>{footer}</div>
      )}
    </div>
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
//
// ┌─────────────────────────────────┐
// │ SectionShell (card/flat/inset)  │
// │ ┌───────────────────────────┐   │
// │ │ title          [trailing] │   │
// │ ├───────────────────────────┤   │
// │ │ Stack (gap-sm)            │   │
// │ │  {children}               │   │
// │ │   ├─ field row            │   │
// │ │   ├─ field row            │   │
// │ │   └─ ...                  │   │
// │ └───────────────────────────┘   │
// └─────────────────────────────────┘

/**
 * Section sub-component for CrudDetail.
 *
 * @example Basic
 * ```tsx
 * <CrudDetail.Section title="Basic Info" variant="flat">
 *   ...
 * </CrudDetail.Section>
 * ```
 *
 * @example Icon in title
 * ```tsx
 * <CrudDetail.Section title={<><MapPinIcon className="size-4" /> Location</>} variant="flat">
 *   ...
 * </CrudDetail.Section>
 * ```
 *
 * @example Trailing action
 * ```tsx
 * <CrudDetail.Section title="Details" trailing={<Button size="sm" variant="outline">Edit</Button>}>
 *   ...
 * </CrudDetail.Section>
 * ```
 */
export type CrudDetailSectionProps = SectionShellProps;

function DetailSection(props: CrudDetailSectionProps) {
  const { SectionShell } = useUIComponents();
  return (
    <SectionShell {...props}>
      <Stack gap="sm">
        {props.children}
      </Stack>
    </SectionShell>
  );
}

// ── Detail.Actions ──
//
// ┌─────────────────────────────────┐
// │ Actions  (border-t, flex row)   │
// │  {children}                     │
// └─────────────────────────────────┘

/** Props for the CrudDetail.Actions sub-component. */
export interface CrudDetailActionsProps {
  className?: string;
  children?: ReactNode;
}

function DetailActions({ className, children }: CrudDetailActionsProps) {
  return (
    <Flex gap="sm" className={cn("border-t pt-2", className)}>
      {children}
    </Flex>
  );
}

// ── Detail.DefaultActions ──
//
// ┌─────────────────────────────────────┐
// │ DefaultActions  (border-t)          │
// │                                     │
// │ ┌──────────┐     ┌──────┐ ┌──────┐  │
// │ │ ← Back   │     │  [X] │ │ Edit │  │
// │ │ or Close │     │      │ │      │  │
// │ └──────────┘     └──────┘ └──────┘  │
// │  (onBack/Close)  (onDelete)(onEdit) │
// └─────────────────────────────────────┘

/** Props for the CrudDetail.DefaultActions sub-component. */
export interface CrudDetailDefaultActionsProps {
  onClose?: () => void;
  /** Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`. */
  onBack?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  /** Label for the close button (defaults to `"Close"`). */
  closeLabel?: string;
  /** Label for the back button (defaults to `"Back"`). */
  backLabel?: string;
  /** Label for the edit button (defaults to `"Edit"`). */
  editLabel?: string;
  className?: string;
}

function DetailDefaultActions({ onClose, onBack, onDelete, onEdit, closeLabel, backLabel, editLabel, className }: CrudDetailDefaultActionsProps) {
  const { t } = useTranslation("simplix/ui");
  const hasLeft = onBack || onClose;
  return (
    <DetailActions className={cn(hasLeft ? "justify-between" : "justify-end", className)}>
      {onBack ? (
        <Button type="button" size="sm" variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
          {backLabel ?? t("common.back")}
        </Button>
      ) : onClose ? (
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {closeLabel ?? t("common.close")}
        </Button>
      ) : null}
      <Flex gap="sm">
        {onDelete && (
          <Button type="button" size="icon-sm" variant="outline" onClick={onDelete}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button type="button" size="sm" variant="primary" onClick={onEdit}>
            {editLabel ?? t("common.edit")}
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
 * ```
 * ┌─────────────────────────────────────┐
 * │  header                       [X]   │
 * ├─────────────────────────────────────┤
 * │  <CrudDetail.Section>               │
 * │    field rows (label: value)        │
 * │  </CrudDetail.Section>             │
 * ├─────────────────────────────────────┤
 * │  AuditFooter (via auditData prop)  │
 * ├─────────────────────────────────────┤
 * │  <CrudDetail.DefaultActions>        │
 * │  [← Back]        [Delete] [Edit]   │
 * └─────────────────────────────────────┘
 * ```
 *
 * Sub-components: Section, Actions, DefaultActions, AuditFooter.
 */
export const CrudDetail = Object.assign(DetailRoot, {
  Section: DetailSection,
  Actions: DetailActions,
  DefaultActions: DetailDefaultActions,
  AuditFooter: DetailAuditFooter,
});
