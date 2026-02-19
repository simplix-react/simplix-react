import { useCallback, useEffect, useRef, useState } from "react";

/** Possible states of the autosave mechanism. */
export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/** Configuration options for the {@link useAutosave} hook. */
export interface UseAutosaveOptions {
  /** Current form values to watch for changes. */
  values: Record<string, unknown>;
  /** Callback invoked with the current values when autosave triggers. */
  onSave: (values: Record<string, unknown>) => void | Promise<void>;
  /** Debounce interval in milliseconds. Defaults to 2000. */
  debounceMs?: number;
  /** Enable or disable autosave. Defaults to true. */
  enabled?: boolean;
  /** Whether the form currently has validation errors. Skips save if true. */
  hasErrors?: boolean;
}

/** Return value of the {@link useAutosave} hook. */
export interface UseAutosaveReturn {
  /** Timestamp of the last successful save, or null if never saved. */
  lastSavedAt: Date | null;
  /** Whether a save operation is currently in progress. */
  isSaving: boolean;
  /** Current autosave status. */
  status: AutosaveStatus;
}

/**
 * Debounced autosave hook that watches form values for changes.
 * Automatically saves after a configurable debounce interval.
 * Skips save when the form has validation errors.
 */
export function useAutosave({
  values,
  onSave,
  debounceMs = 2000,
  enabled = true,
  hasErrors = false,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const serializedValues = JSON.stringify(values);
  const previousRef = useRef(serializedValues);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || hasErrors) return;

    // Skip on first render or if values haven't changed
    if (previousRef.current === serializedValues) return;
    previousRef.current = serializedValues;

    clearTimer();

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSaveRef.current(values);
        setStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setStatus("error");
      }
    }, debounceMs);

    return clearTimer;
  }, [serializedValues, enabled, hasErrors, debounceMs, clearTimer, values]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  return {
    lastSavedAt,
    isSaving: status === "saving",
    status,
  };
}
