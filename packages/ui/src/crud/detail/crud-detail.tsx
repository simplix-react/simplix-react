import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

import { Flex } from "../../primitives/flex";
import { Grid } from "../../primitives/grid";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
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
   * - `"default"` — compact padding for side panels (px-3).
   * - `"dialog"` — generous padding for use inside Dialog (px-5, extra vertical padding on header/footer).
   */
  variant?: CrudDetailVariant;
  /** Audit metadata rendered as a fixed bar between the scrollable body and the footer. */
  auditData?: AuditData;
  /**
   * IANA display timezone for the audit footer's timestamps. Falls back to the
   * ambient `DisplayZoneProvider` zone (then the browser zone) when omitted —
   * pass it on screens whose fields pin a zone other than the ambient one so
   * the audit stamps agree with the rest of the panel.
   */
  displayZone?: string;
  fieldVariant?: FieldVariant;
  className?: string;
  children?: ReactNode;
}

function DetailRoot({ isLoading, onClose, header, footer, variant = "default", auditData, displayZone, fieldVariant, className, children }: CrudDetailProps) {
  const { Button } = useFlatUIComponents();
  const isDialog = variant === "dialog";
  // Header / body / footer share one horizontal padding so their edges stay
  // aligned. Side panels sit flush to the panel width (the enclosing
  // `ListDetail.Detail` already insets from the divider); dialogs keep an
  // inner gutter. The body scrolls with a plain overflow — no reserved
  // scrollbar gutter — so a scrollbar appears at the edge only when needed.
  const px = isDialog ? "px-5" : "";

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
      <div data-crud-slot="body" className={cn("flex flex-col flex-1 min-h-0 overflow-auto", px)}>
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
          <div data-crud-slot="audit" className="pt-4 pb-2">
            <DetailAuditFooter auditData={auditData} displayZone={displayZone} />
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
/** Column layouts for a detail section body, mirroring `CrudForm.Section`'s `layout`. */
const detailLayoutColumns = {
  "single-column": 1,
  "two-column": 2,
  "three-column": 3,
} as const;

export interface CrudDetailSectionProps extends SectionShellProps {
  /**
   * Field arrangement inside the section body. `"single-column"` (default)
   * stacks rows; `"two-column"` / `"three-column"` lay fields out in a grid
   * with a wide column gutter and the same tight row rhythm as the stack.
   * Use this instead of a hand-rolled `<Grid>` so row spacing and left inset
   * stay framework-governed across every detail screen.
   */
  layout?: keyof typeof detailLayoutColumns;
}

function DetailSection({ layout = "single-column", ...props }: CrudDetailSectionProps) {
  const { SectionShell } = useFlatUIComponents();
  const columns = detailLayoutColumns[layout];
  return (
    <SectionShell {...props}>
      {columns === 1 ? (
        <Stack gap="xs" className="pl-2">
          {props.children}
        </Stack>
      ) : (
        <Grid columns={columns} gapX="lg" gapY="xs" divider className="pl-2">
          {props.children}
        </Grid>
      )}
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

/** Props for the CrudDetail.DefaultActions sub-component, shared with CrudDetail.ActionFooter. */
export interface CrudDetailDefaultActionsProps {
  onClose?: () => void;
  /** Renders a "← Back" button instead of "Close". Mutually exclusive with `onClose`. */
  onBack?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  /** When true, disables Edit and Delete action buttons. */
  isPending?: boolean;
  /** Label for the close button (defaults to `"Close"`). */
  closeLabel?: string;
  /** Label for the back button (defaults to `"Back"`). */
  backLabel?: string;
  /** Label for the edit button (defaults to `"Edit"`). */
  editLabel?: string;
  className?: string;
  /** Extra action buttons rendered in the right-side group, before Edit. */
  children?: React.ReactNode;
  /** Disables Edit on its own (independent of `isPending`); pair with `editDisabledReason`. */
  editDisabled?: boolean;
  /** Native tooltip explaining why Edit is disabled. */
  editDisabledReason?: string;
  /** Disables Delete on its own (independent of `isPending`); pair with `deleteDisabledReason`. */
  deleteDisabled?: boolean;
  /** Native tooltip explaining why Delete is disabled. */
  deleteDisabledReason?: string;
}

/**
 * Builds the standard footer row parts — the left Close/Back button and the right
 * Delete / children / Edit group — shared by {@link DetailDefaultActions} and
 * {@link DetailActionFooter}. A not-applicable Edit/Delete stays visible but disabled,
 * carrying a `title` reason, rather than being hidden — the action bar is stable.
 */
function useStandardDetailActions({ onClose, onBack, onDelete, onEdit, isPending, closeLabel, backLabel, editLabel, children, editDisabled, editDisabledReason, deleteDisabled, deleteDisabledReason }: CrudDetailDefaultActionsProps) {
  const { Button } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const hasLeft = Boolean(onBack || onClose);

  const leftButton = onBack ? (
    <Button type="button" size="sm" variant="outline" onClick={onBack}>
      <ArrowLeftIcon className="h-4 w-4" />
      {backLabel ?? t("common.back")}
    </Button>
  ) : onClose ? (
    <Button type="button" size="sm" variant="outline" onClick={onClose}>
      {closeLabel ?? t("common.close")}
    </Button>
  ) : null;

  const rightGroup = (
    <Flex gap="sm">
      {onDelete && (
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={onDelete}
          disabled={isPending || deleteDisabled}
          title={deleteDisabled ? deleteDisabledReason : undefined}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
      {children}
      {onEdit && (
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={onEdit}
          disabled={isPending || editDisabled}
          title={editDisabled ? editDisabledReason : undefined}
        >
          {editLabel ?? t("common.edit")}
        </Button>
      )}
    </Flex>
  );

  return { leftButton, rightGroup, hasLeft };
}

/**
 * Standard single-row detail footer: Close/Back on the left, Delete / extra children /
 * Edit on the right. Use {@link DetailActionFooter} when the entity has domain
 * lifecycle actions that need their own row above this one.
 */
function DetailDefaultActions(props: CrudDetailDefaultActionsProps) {
  const { leftButton, rightGroup, hasLeft } = useStandardDetailActions(props);
  return (
    <DetailActions className={cn(hasLeft ? "justify-between" : "justify-end", props.className)}>
      {leftButton}
      {rightGroup}
    </DetailActions>
  );
}

// ── Detail.ActionFooter ──
//
// ┌─────────────────────────────────────┐
// │ ActionFooter  (border-t)            │
// │  [ Submit ] [ Review ] [ Cancel ]   │  ← domain lifecycle actions (wrap)
// │ ┌──────────┐     ┌──────┐ ┌──────┐  │
// │ │ ← Close  │     │ [X]  │ │ Edit │  │  ← standard row
// │ └──────────┘     └──────┘ └──────┘  │
// └─────────────────────────────────────┘

/** Props for the CrudDetail.ActionFooter sub-component. */
export interface CrudDetailActionFooterProps extends CrudDetailDefaultActionsProps {
  /**
   * Domain lifecycle action buttons (submit, review, cancel, resend, renew, …) that
   * fill the footer's top row. Actions that are not currently applicable stay visible
   * but disabled (with a `title` reason) rather than being hidden, so the action bar is
   * stable regardless of the record's state.
   */
  actions: ReactNode;
}

/**
 * Two-tier detail footer: a wrapping row of domain lifecycle `actions` on top, the
 * standard Close/Back + Delete/Edit row beneath — for detail panels whose entity has
 * more actions than the single {@link DetailDefaultActions} row holds. The two rows
 * share one divider above the whole block.
 */
function DetailActionFooter({ actions, ...rest }: CrudDetailActionFooterProps) {
  const { leftButton, rightGroup, hasLeft } = useStandardDetailActions(rest);
  return (
    <Stack gap="sm" className={cn("border-t pt-2", rest.className)}>
      {/* Domain actions share the footer width evenly — an action tier that hugs
          its labels reads as a stray button cluster next to the standard row. */}
      <Flex gap="sm" align="center" className="flex-wrap [&>*]:flex-1">
        {actions}
      </Flex>
      {/* A divider separates the domain-action tier from the standard row. */}
      <Flex gap="sm" align="center" className={cn("border-t pt-2", hasLeft ? "justify-between" : "justify-end")}>
        {leftButton}
        {rightGroup}
      </Flex>
    </Stack>
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
 * Sub-components: Section, Actions, DefaultActions, ActionFooter, AuditFooter.
 * Use `DefaultActions` for a single-row footer, `ActionFooter` for a two-tier footer
 * (a domain lifecycle-action row above the standard row).
 */
export const CrudDetail = Object.assign(DetailRoot, {
  Section: DetailSection,
  Actions: DetailActions,
  DefaultActions: DetailDefaultActions,
  ActionFooter: DetailActionFooter,
  AuditFooter: DetailAuditFooter,
});
