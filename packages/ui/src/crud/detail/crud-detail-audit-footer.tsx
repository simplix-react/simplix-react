import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useState } from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
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
}

/** Display last 12 chars when the value is a UUID. */
function formatDisplayId(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id.slice(-12) : id;
}

/** Format an ISO string into a compact 24h date-time (e.g. "2026-03-12 17:44"). Returns `null` on failure. */
function formatAuditDate(dateString: string): string | null {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}`;
  } catch {
    return null;
  }
}

export function DetailAuditFooter({ auditData }: CrudDetailAuditFooterProps) {
  const { t } = useTranslation("simplix/ui");
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback(async () => {
    if (!auditData?.id) return;
    await navigator.clipboard.writeText(auditData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [auditData?.id]);

  const hasId = auditData?.id != null && auditData.id !== "";
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
                <span className="truncate">{formatDisplayId(auditData!.id!)}</span>
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
                <p className="font-mono text-[11px]">{auditData!.id}</p>
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
              {formatAuditDate(auditData!.createdAt!) ?? auditData!.createdAt}
            </span>
          )}
          {hasUpdated && (
            <span className="flex items-center gap-1">
              <PencilIcon className="h-3.5 w-3.5 shrink-0" />
              {formatAuditDate(auditData!.updatedAt!) ?? auditData!.updatedAt}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
