import { useSyncExternalStore } from "react";
import type { ServerErrorEvent } from "@simplix-react/api";

// Module-level state
let errors: ServerErrorEvent[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function dispatchError(event: ServerErrorEvent) {
  // Deduplication: same message + errorCode → skip
  const isDuplicate = errors.some(
    (e) => e.message === event.message && e.errorCode === event.errorCode,
  );
  if (isDuplicate) return;
  errors = [...errors, event];
  emit();
}

export function dismissError() {
  errors = errors.slice(1);
  emit();
}

export function dismissAllErrors() {
  errors = [];
  emit();
}

export function useErrorStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => errors,
  );
}
