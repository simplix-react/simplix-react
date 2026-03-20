import { useSyncExternalStore } from "react";

export interface Toast {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
  action?: { label: string; href: string };
}

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS: Record<Toast["type"], number | null> = {
  success: 5000,
  info: 5000,
  warning: 10000,
  error: null, // manual dismiss only
};

// Module-level state
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((l) => l());
}

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
