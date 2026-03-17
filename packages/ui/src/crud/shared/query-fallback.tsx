import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useState, useEffect, type ReactNode } from "react";

import { ConfirmDialog } from "./confirm-dialog";

/** Props for the {@link QueryFallback} component. */
export interface QueryFallbackProps {
  /** Whether the query is currently loading. */
  isLoading: boolean;
  /** Message to display when data is not found. Defaults to `"Not found."`. */
  notFoundMessage?: string;
  /** Callback invoked when data is confirmed not found (loading complete, no data). */
  onNotFound?: () => void;
}

/**
 * Fallback component for query loading and not-found states.
 *
 * When `onNotFound` is provided, displays a dialog informing the user that
 * the data was not found. Clicking confirm triggers `onNotFound` (typically
 * closing the detail panel and returning to the list).
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGet(id);
 * if (isLoading || !data) return <QueryFallback isLoading={isLoading} notFoundMessage="Pet not found." onNotFound={onClose} />;
 * ```
 */
export function QueryFallback({
  isLoading,
  notFoundMessage,
  onNotFound,
}: QueryFallbackProps): ReactNode {
  const { t } = useTranslation("simplix/ui");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && onNotFound) setDialogOpen(true);
  }, [isLoading, onNotFound]);

  const handleNotFoundConfirm = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    url.searchParams.delete("mode");
    window.history.replaceState(null, "", url.pathname + url.search);
    onNotFound?.();
  }, [onNotFound]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (onNotFound) {
    return (
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("common.notFoundTitle")}
        description={notFoundMessage ?? t("common.notFoundDescription")}
        hideCancel
        onConfirm={handleNotFoundConfirm}
      />
    );
  }

  return (
    <div className="text-muted-foreground">
      {notFoundMessage ?? t("common.notFound")}
    </div>
  );
}
