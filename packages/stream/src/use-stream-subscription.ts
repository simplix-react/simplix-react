import { useEffect, useId, useState } from "react";
import { useStreamContext } from "./stream-provider";
import type { SubscriptionRequest } from "./types";

interface StreamSubscriptionOptions {
  /** Optional parameters for the subscription. */
  params?: Record<string, string>;

  /**
   * Whether to register a server-side subscription via the API.
   *
   * Set to `false` for event-source (push) resources that are broadcast
   * to all connected SSE clients without explicit subscription.
   * Defaults to `true` for poll-based (DataCollector) resources.
   */
  subscribe?: boolean;
}

/**
 * Subscribe to a SSE resource and receive data updates.
 *
 * Registers a subscription in the global registry on mount and
 * unregisters on unmount. The registry syncs the full subscription
 * set to the server via a single PUT call (debounced).
 *
 * @param resource - The resource name to listen for (e.g., "middleware-health")
 * @param options - Subscription options
 * @returns The latest data received from the stream
 */
export function useStreamSubscription<T = unknown>(
  resource: string,
  options?: StreamSubscriptionOptions,
): T | null {
  const { params, subscribe: shouldSubscribe = true } = options ?? {};
  const { addEventListener, registerSubscription, unregisterSubscription } = useStreamContext();
  const [data, setData] = useState<T | null>(null);
  const id = useId();

  // Register/unregister subscription in the global registry
  useEffect(() => {
    if (!shouldSubscribe) return;

    const request: SubscriptionRequest = { resource };
    if (params) {
      request.params = params;
    }

    registerSubscription(id, request);
    return () => unregisterSubscription(id);
  }, [shouldSubscribe, id, resource, params, registerSubscription, unregisterSubscription]);

  // Listen for data events
  useEffect(() => {
    const unsubscribe = addEventListener(resource, (incoming) => {
      setData(incoming as T);
    });
    return unsubscribe;
  }, [resource, addEventListener]);

  return data;
}
