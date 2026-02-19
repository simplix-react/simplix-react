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
  notFoundMessage = "Not found.",
  loadingMessage = "Loading...",
}: QueryFallbackProps): ReactNode {
  return (
    <div className="text-muted-foreground">
      {isLoading ? loadingMessage : notFoundMessage}
    </div>
  );
}
