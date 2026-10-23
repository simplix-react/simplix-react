import { useSyncExternalStore } from "react";
import { generateLocalId } from "./local-id";

export interface Toast {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
  action?: ToastAction;
}

/**
 * What the toast's one action does: go somewhere, or run something on the spot (an undo).
 *
 * <p>A `run` action closes the toast after it runs, so pressing 「실행 취소」 twice cannot undo
 * twice.
 */
export type ToastAction = { label: string; href: string } | { label: string; run: () => void };

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS: Record<Toast["type"], number | null> = {
  success: 5000,
  info: 5000,
  warning: 10000,
  // Errors linger longer but still auto-dismiss: a permanent toast survives
  // route changes and can sit over action buttons indefinitely.
  error: 15000,
};

// Module-level state
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((l) => l());
}

function generateId(): string {
  return `toast-${generateLocalId()}`;
}

export function addToast(toast: Omit<Toast, "id">) {
  // Deduplication: same type + message -> skip
  const isDuplicate = toasts.some(
    (t) => t.type === toast.type && t.message === toast.message,
  );
  if (isDuplicate) return;

  const id = generateId();
  const newToast: Toast = { ...toast, id };

  toasts = [...toasts, newToast];

  // Enforce max visible toasts
  if (toasts.length > MAX_TOASTS) {
    const removed = toasts[0];
    toasts = toasts.slice(1);
    const timer = timers.get(removed.id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(removed.id);
    }
  }

  // Auto-dismiss
  const duration = AUTO_DISMISS_MS[toast.type];
  if (duration !== null) {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    timers.set(id, timer);
  }

  emit();
}

export function removeToast(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/**
 * Runs a toast's `run` action and closes the toast; a link action is followed by the container.
 *
 * @param id - the toast whose action was pressed
 */
export function runToastAction(id: string) {
  const toast = toasts.find((t) => t.id === id);
  if (toast?.action && "run" in toast.action) {
    toast.action.run();
    removeToast(id);
  }
}

export function useToastStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => toasts,
  );
}
