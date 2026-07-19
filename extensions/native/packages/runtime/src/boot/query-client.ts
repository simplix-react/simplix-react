import { classifyError, type ServerErrorEvent } from "@simplix-react/api";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { dispatchError } from "../error/error-store";

/** Options for {@link createNativeQueryClient}. */
export interface CreateNativeQueryClientOptions {
  /**
   * Filter before an error event reaches the global error dialog. Return
   * `false` to suppress the dialog (the caller handles it elsewhere —
   * e.g. 401 flowing into a re-registration screen).
   */
  onErrorEvent?: (event: ServerErrorEvent) => boolean | void;
}

/**
 * QueryClient with the standard native error policy:
 *
 * - mutations flagged `meta.handledByForm` are left to form field errors,
 * - `"validation"` events are left to form field errors,
 * - pure network transport failures skip the dialog (inline list/detail
 *   error states cover them; the dialog's value is the server's message),
 * - everything else opens the global error dialog via {@link dispatchError}.
 */
export function createNativeQueryClient(
  options?: CreateNativeQueryClientOptions,
): QueryClient {
  const shouldDispatch = (event: ServerErrorEvent): boolean => {
    if (event.category === "validation") return false;
    if (options?.onErrorEvent?.(event) === false) return false;
    return true;
  };

  const mutationCache = new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.handledByForm) return;
      const event = classifyError(error);
      if (shouldDispatch(event)) dispatchError(event);
    },
  });

  const queryCache = new QueryCache({
    onError: (error) => {
      const event = classifyError(error);
      if (event.category === "network") return;
      if (shouldDispatch(event)) dispatchError(event);
    },
  });

  return new QueryClient({
    mutationCache,
    queryCache,
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
