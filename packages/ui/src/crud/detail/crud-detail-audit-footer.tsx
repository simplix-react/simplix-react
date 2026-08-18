import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useState } from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { formatDateTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";
import { useDefaultDisplayZone } from "../shared/display-zone-context";
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
  /**
   * What a person calls this record — `ORG-014`, `usr_0031`, a rank's code.
   *
   * <p><b>Shown instead of the identifier when it is given.</b> A UUID's last twelve characters
   * (`3cef61f63b81`) are what the footer falls back to, and they are not an answer to any question
   * a reader has: they cannot be read aloud, matched against a printed list, or searched for in
   * another system. Most records already carry a code the operator knows — the DTO usually has it
   * — and passing it turns the footer's one identifying line into something the reader recognises.
   *
   * <p>The identifier is still there: the tooltip shows it in full, so a developer reading over a
   * shoulder can take it.
   */
  code?: string;
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

  const shown = auditData?.code || (auditData?.id ? formatDisplayId(auditData.id) : "");

  // **What is shown and what is copied are deliberately different, and that is the point of this
  // control.** It exists so somebody can get the record's identifier onto the clipboard — for a
  // ticket, a query, a support thread — which is what the tooltip's own wording promises. The code
  // beside it is there so a person can read the row; the identifier is there so a machine can be
  // given it. Making the two agree looks like consistency and removes the only reason the button
  // exists: a reader who wanted `NORTH-ELEC` on the clipboard can select it from the label, and a
  // reader who wants the UUID has nowhere else to get it.
  const handleCopyId = useCallback(async () => {
    if (!auditData?.id) return;
    await navigator.clipboard.writeText(auditData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [auditData?.id]);

  // The row is drawn when there is something to show; the copy is wired only when there is an
  // identifier to copy, which are not the same condition once a code can stand alone.
  const hasId = shown !== "";
  const hasCreated = auditData?.createdAt != null && auditData.createdAt !== "";
  const hasUpdated = auditData?.updatedAt != null && auditData.updatedAt !== "";

  if (!hasId && !hasCreated && !hasUpdated) return null;

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      {/* Left: ID */}
      {hasId ? (
        <TooltipPrimitive.Provider delayDuration={0}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1.5 font-mono text-left hover:text-foreground transition-colors"
              >
                <IdCardIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{shown}</span>
                {copied && <CheckIcon className="h-3 w-3 shrink-0 text-green-600" />}
              </button>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                align="start"
                sideOffset={4}
                className="z-50 rounded-md border bg-popover px-3 py-1.5 text-popover-foreground shadow-sm animate-in fade-in-0 zoom-in-95"
              >
                <p className="font-mono text-[11px]">{shown}</p>
                {/* The identifier stays reachable even when a code is what the row shows: the
                    reader recognises the code, and whoever has to query the database needs this. */}
                {auditData?.code && auditData?.id && (
                  <p className="font-mono text-[11px] text-muted-foreground">{auditData.id}</p>
                )}
                <p className="text-muted-foreground text-[11px]">
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
        <div className="ml-auto flex items-center gap-3">
          {hasCreated && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              {formatAuditDate(auditData!.createdAt!, zone, locale) ?? auditData!.createdAt}
            </span>
          )}
          {hasUpdated && (
            <span className="flex items-center gap-1">
              <PencilIcon className="h-3.5 w-3.5 shrink-0" />
              {formatAuditDate(auditData!.updatedAt!, zone, locale) ?? auditData!.updatedAt}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
