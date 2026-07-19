import type { ServerErrorEvent } from "@simplix-react/api";
import { useSyncExternalStore } from "react";

// Module-level current-error store: the error dialog shows one event at a
// time; a new event replaces the visible one (the dialog's value is the
// server's own message, not a queue of stack traces).
let current: ServerErrorEvent | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Show a classified error event in the global error dialog. */
export function dispatchError(event: ServerErrorEvent): void {
  current = event;
  emit();
}

/** Dismiss the currently shown error event. */
export function clearError(): void {
  current = null;
  emit();
}

/** Subscribe to the current error event (`null` when none). */
export function useErrorEvent(): ServerErrorEvent | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
  );
}
