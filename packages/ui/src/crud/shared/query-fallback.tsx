import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

/** Props for the {@link QueryFallback} component. */
export interface QueryFallbackProps {
  /** Whether the query is currently loading. */
  isLoading: boolean;
  /** Message to display when data is not found. Defaults to `"Not found."`. */
  notFoundMessage?: string;
  /** Message to display while loading. Defaults to `"Loading..."`. */
  loadingMessage?: string;
}

/**
 * Fallback component for query loading and not-found states.
 *
 * Use as an early-return guard in pages that fetch a single entity:
 *
 * ```tsx
 * const { data, isLoading } = useGet(id);
 * if (isLoading || !data) return <QueryFallback isLoading={isLoading} notFoundMessage="Pet not found." />;
 * ```
 */
export function QueryFallback({
  isLoading,
  notFoundMessage,
  loadingMessage,
}: QueryFallbackProps): ReactNode {
  const { t } = useTranslation("simplix/ui");
  return (
    <div className="text-muted-foreground">
      {isLoading ? (loadingMessage ?? t("common.loading")) : (notFoundMessage ?? t("common.notFound"))}
    </div>
  );
}
