import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useState } from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { formatDateTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { useDefaultDisplayZone } from "../shared/display-zone-context";
import { slotAttributes } from "../../design/slot-style";
import {
  crudDetailAuditCopiedStyle,
  crudDetailAuditDateStyle,
  crudDetailAuditDatesStyle,
  crudDetailAuditFooterStyle,
  crudDetailAuditIdStyle,
  crudDetailAuditTooltipHintStyle,
  crudDetailAuditTooltipIdStyle,
  crudDetailAuditTooltipStyle,
} from "./crud-detail-audit-footer.style";
import { CalendarIcon, CheckIcon, IdCardIcon, PencilIcon } from "../shared/icons";

// ── AuditFooter ──
//
// ┌─────────────────────────────────────────────────┐
// │ AuditFooter  (rounded border, text-xs, muted)   │
// │                                                 │
// │ [ID] a1b2c3d4e5f6         Created  2026-03-11   │
// │                           Modified 2026-03-12   │
// └─────────────────────────────────────────────────┘

/** Audit metadata passed to {@link DetailAuditFooter}. */
export interface AuditData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Props for the {@link DetailAuditFooter} sub-component. */
export interface CrudDetailAuditFooterProps {
  /** Audit metadata. When nullish or all fields empty, the component renders nothing. */
  auditData?: AuditData;
  /**
   * IANA display zone for the created/updated instants. When set, both stamps
   * render as that zone's wall clock; when omitted, the browser zone applies.
   */
  displayZone?: string;
}

/** Display last 12 chars when the value is a UUID. */
function formatDisplayId(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id.slice(-12) : id;
}

/**
 * Format an ISO instant into a locale-aware date-time in `displayZone` (browser zone
 * when omitted), matching how the panel's own date fields render. Returns `null` on failure.
 */
function formatAuditDate(dateString: string, displayZone?: string, locale?: string): string | null {
  const date = parseDate(dateString);
  if (!date || Number.isNaN(date.getTime())) return null;
  return formatDateTime(date, locale, displayZone);
}

export function DetailAuditFooter({ auditData, displayZone }: CrudDetailAuditFooterProps) {
  const { t, locale } = useTranslation("simplix/ui");
  // Explicit prop wins; otherwise the app-level ambient default replaces the browser zone.
  const defaultZone = useDefaultDisplayZone();
  const zone = displayZone ?? defaultZone;
  const [copied, setCopied] = useState(false);

  // **This line is not where a record is named — it is where its machine identifier is picked up.**
  // The short form, the tooltip's full value and the copy all point at the one thing, and the
  // tooltip says so in as many words. That makes it a deliberate exception to 「a raw id is not
  // drawn on a screen」, and the exception IS the control's reason for existing: a reader who wants
  // the record's name has the panel's title, its fields and its list row, and nowhere else to get
  // the UUID.
  //
  // **It has now been replaced with a human-readable code three times**, each by somebody applying
  // that general rule to this line without asking what the line was for. The third added a `code`
  // prop to do it and was reverted by the product's own designer within the hour, with the code
  // already on the panel two rows above as its own field — which is the whole point. There is no
  // shape of this change that is right. Anyone about to try a fourth: the name belongs above, not
  // here, and so does the code.
  const shown = auditData?.id ? formatDisplayId(auditData.id) : "";

  const handleCopyId = useCallback(async () => {
    if (!auditData?.id) return;
    await navigator.clipboard.writeText(auditData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [auditData?.id]);

  const hasId = shown !== "";
  const hasCreated = auditData?.createdAt != null && auditData.createdAt !== "";
  const hasUpdated = auditData?.updatedAt != null && auditData.updatedAt !== "";

  if (!hasId && !hasCreated && !hasUpdated) return null;

  return (
    <div className="flex items-center" {...slotAttributes(crudDetailAuditFooterStyle, {})}>
      {/* Left: ID */}
      {hasId ? (
        <TooltipPrimitive.Provider delayDuration={0}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center"
                {...slotAttributes(crudDetailAuditIdStyle, {})}
              >
                <IdCardIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{shown}</span>
                {/* The icon takes no data attributes, so the slot sits on a wrapper; the tick pops in as the copy lands. */}
                {copied && (
                  <span className="inline-flex shrink-0 animate-in zoom-in-50 fade-in-0" {...slotAttributes(crudDetailAuditCopiedStyle, {})}>
                    <CheckIcon className="h-3 w-3" />
                  </span>
                )}
              </button>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                align="start"
                sideOffset={4}
                // Entry motion is tw-animate-css, which a design stylesheet cannot @apply; it stays
                // on the element, the same in every design: the shared appear (fade, 4px rise from the trigger).
                className="z-50 animate-in fade-in-0 slide-in-from-bottom-1"
                {...slotAttributes(crudDetailAuditTooltipStyle, {})}
              >
                <p {...slotAttributes(crudDetailAuditTooltipIdStyle, {})}>{auditData!.id}</p>
                <p {...slotAttributes(crudDetailAuditTooltipHintStyle, {})}>
                  {copied ? t("audit.copied") : t("audit.clickToCopy")}
                </p>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      ) : (
        <span />
      )}

      {/* Right: Dates (single row, right-aligned) */}
      {(hasCreated || hasUpdated) && (
        <div className="flex items-center" {...slotAttributes(crudDetailAuditDatesStyle, {})}>
          {/* **Each date says which one it is.** The icons are decorative and hidden from the
              tree, so without a label a sighted reader tells the creation from the change by a
              3.5-unit glyph and a screen reader is read two bare dates in a row with nothing
              separating them. `audit.created` and `audit.modified` were already in every locale
              and nothing drew them. */}
          {hasCreated && (
            <span className="flex items-center" {...slotAttributes(crudDetailAuditDateStyle, {})} title={t("audit.created")} aria-label={`${t("audit.created")}: ${formatAuditDate(auditData!.createdAt!, zone, locale) ?? auditData!.createdAt}`}>
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              {formatAuditDate(auditData!.createdAt!, zone, locale) ?? auditData!.createdAt}
            </span>
          )}
          {hasUpdated && (
            <span className="flex items-center" {...slotAttributes(crudDetailAuditDateStyle, {})} title={t("audit.modified")} aria-label={`${t("audit.modified")}: ${formatAuditDate(auditData!.updatedAt!, zone, locale) ?? auditData!.updatedAt}`}>
              <PencilIcon className="h-3.5 w-3.5 shrink-0" />
              {formatAuditDate(auditData!.updatedAt!, zone, locale) ?? auditData!.updatedAt}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
