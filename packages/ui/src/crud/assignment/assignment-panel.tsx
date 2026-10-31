import type { ReactNode } from "react";

import { useLocale, useTranslation } from "@simplix-react/i18n/react";
import { resolveEmptyReason } from "@simplix-react/headless";
import { Card, Flex, Text } from "../../primitives";
import { slotAttributes } from "../../design/slot-style";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { EmptyState } from "../shared/empty-state";
import { CrudList } from "../list/crud-list";
import type { RowActionDef } from "../list/crud-list";
import type { EmptyReason } from "../shared/types";
import {
  crudAssignmentPanelBodyStyle,
  crudAssignmentPanelChipRemoveStyle,
  crudAssignmentPanelChipStyle,
  crudAssignmentPanelChipsStyle,
  crudAssignmentPanelEmptyStyle,
  crudAssignmentPanelHeaderStyle,
  crudAssignmentPanelRequiredStyle,
} from "./assignment-panel.style";

// ── Icons ──

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ── Types ──

interface AssignmentPanelProps {
  /** Panel title displayed in the header. */
  title: string;
  /** Count badge displayed next to the title. */
  count: number;
  /**
   * Marks the title with the required asterisk, for a panel whose table must not be left empty.
   * The rows are added by the panel's own action, so there is no field label to carry the mark.
   */
  required?: boolean;
  /** Action slot rendered on the right side of the header (e.g. SearchPopover). */
  action?: ReactNode;
  /** Body content: use AssignmentPanel.Table or AssignmentPanel.Chips. */
  children: ReactNode;
}

interface AssignmentTableProps<T> {
  /** Data array. */
  data: T[];
  /** Loading state. */
  isLoading?: boolean;
  /** Empty state configuration. */
  emptyState?: { icon?: ReactNode; title: string; description?: string };
  /** Computed empty reason (overrides auto-detection from data). */
  emptyReason?: EmptyReason;
  /** Settled query rejection. Feeds auto-detection when `emptyReason` is omitted. */
  error?: Error | null;
  /**
   * Whether the query is stalled (React Query `fetchStatus === "paused"`).
   * Feeds auto-detection when `emptyReason` is omitted — without it a stalled
   * fetch renders as "no data".
   */
  isPaused?: boolean;
  /** Consecutive failed fetch attempts. Feeds auto-detection when `emptyReason` is omitted. */
  failureCount?: number;
  /** Extract unique row ID. */
  rowId: (row: T) => string;
  /** Row actions (e.g. unlink). */
  actions?: RowActionDef<T>[];
  /** Column definitions: use AssignmentPanel.Column. */
  children: ReactNode;
}

interface AssignmentChipsProps<T> {
  /** Data array. */
  data: T[];
  /** Empty state configuration. */
  emptyState?: { icon?: ReactNode; title: string; description?: string };
  /** Render function for each item. Use AssignmentPanel.Chip for consistent styling. */
  renderItem: (item: T, index: number) => ReactNode;
}

/** Props for pre-styled chip element. */
export interface AssignmentChipProps {
  /** Display label. */
  label: string;
  /** Optional icon before label. */
  icon?: ReactNode;
  /** Optional trailing element rendered after the label (e.g. a count Badge). */
  trailing?: ReactNode;
  /** Called when remove button is clicked. Omit to hide remove button. */
  onRemove?: () => void;
}

// ── Components ──

function AssignmentPanelRoot({ title, count, required, action, children }: AssignmentPanelProps) {
  // Grouped by the reader's locale. The count arrives as a number and is drawn as it arrives, so
  // no catalogue string carries the format for it — and an ungrouped 3820 sitting beside a
  // FilterBar total reading 3,820 is one quantity spelled two ways in one picture.
  const locale = useLocale();
  const { Badge } = useFlatUIComponents();
  return (
    <Card padding="none" className="overflow-hidden">
      <div
        className="flex flex-row items-center justify-between"
        {...slotAttributes(crudAssignmentPanelHeaderStyle, {})}
      >
        <Flex gap="sm" align="center">
          <Text size="sm">
            {title}
            {required && (
              <span aria-hidden="true" {...slotAttributes(crudAssignmentPanelRequiredStyle, {})}>
                {/* U+2060 keeps the mark on its label's last line. */}
                {"\u2060*"}
              </span>
            )}
          </Text>
          <Badge variant="secondary">{count.toLocaleString(locale)}</Badge>
        </Flex>
        {action}
      </div>
      <div className="contents" {...slotAttributes(crudAssignmentPanelBodyStyle, {})}>
        {children}
      </div>
    </Card>
  );
}

function AssignmentTable<T>({
  data,
  isLoading,
  emptyState,
  emptyReason,
  error = null,
  isPaused,
  failureCount,
  rowId,
  actions,
  children,
}: AssignmentTableProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const computedEmptyReason = emptyReason ?? resolveEmptyReason({
    hasRows: data.length > 0,
    isLoading: !!isLoading,
    error,
    isPaused,
    failureCount,
  }) ?? undefined;

  if (!isLoading && computedEmptyReason === "no-data" && data.length === 0) {
    const resolved = emptyState ?? { title: t("list.noData") };
    return (
      <div className="contents" {...slotAttributes(crudAssignmentPanelEmptyStyle, {})}>
        <EmptyState {...resolved} />
      </div>
    );
  }

  return (
    <CrudList>
      <CrudList.Table
        data={data}
        isLoading={isLoading}
        emptyReason={computedEmptyReason}
        density="compact"
        rowId={rowId}
        actions={actions}
        actionVariant="icon"
      >
        {children}
      </CrudList.Table>
    </CrudList>
  );
}

function AssignmentChips<T>({
  data,
  emptyState,
  renderItem,
}: AssignmentChipsProps<T>) {
  const { t } = useTranslation("simplix/ui");

  if (data.length === 0) {
    const resolved = emptyState ?? { title: t("list.noData") };
    return (
      <div className="contents" {...slotAttributes(crudAssignmentPanelEmptyStyle, {})}>
        <EmptyState {...resolved} />
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap" {...slotAttributes(crudAssignmentPanelChipsStyle, {})}>
      {data.map(renderItem)}
    </div>
  );
}

function AssignmentChip({ label, icon, trailing, onRemove }: AssignmentChipProps) {
  const { t } = useTranslation("simplix/ui");

  return (
    <div
      className="flex flex-row items-center h-8"
      {...slotAttributes(crudAssignmentPanelChipStyle, {})}
    >
      {icon}
      <Text size="sm">{label}</Text>
      {trailing}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("common.unlink")}
          {...slotAttributes(crudAssignmentPanelChipRemoveStyle, {})}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}

// ── Compound Component ──

/**
 * Assignment panel for 1:N relationship management UIs.
 * Provides a consistent frame (Card + header + body) where modules inject data and rendering.
 *
 * @example
 * ```tsx
 * // Table mode
 * <AssignmentPanel title="Access Levels" count={levels.length}
 *   action={<SearchPopover triggerText="Assign" ... />}
 * >
 *   <AssignmentPanel.Table data={levels} rowId={(r) => r.id} actions={[{ type: "unlink", onClick: handleUnlink }]}>
 *     <AssignmentPanel.Column field="name" header="Name">
 *       {({ row }) => <Text>{row.name}</Text>}
 *     </AssignmentPanel.Column>
 *   </AssignmentPanel.Table>
 * </AssignmentPanel>
 *
 * // Chips mode
 * <AssignmentPanel title="Groups" count={groups.length}
 *   action={<SearchPopover triggerText="Add" ... />}
 * >
 *   <AssignmentPanel.Chips data={groups} renderItem={(g) => (
 *     <AssignmentPanel.Chip key={g.id} label={g.name} onRemove={() => handleRemove(g)} />
 *   )} />
 * </AssignmentPanel>
 * ```
 */
export const AssignmentPanel = Object.assign(AssignmentPanelRoot, {
  Table: AssignmentTable,
  Column: CrudList.Column,
  Chips: AssignmentChips,
  Chip: AssignmentChip,
});
