import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { View } from "react-native";

/** Controls exposed by {@link useIdleReset}. */
export interface IdleResetContextValue {
  /** Restart the idle timer manually (non-touch activity such as a poll answer). */
  reset: () => void;
  /** Pause the timer (during capture or upload); resume with {@link reset}. */
  pause: () => void;
}

const IdleResetContext = createContext<IdleResetContextValue | null>(null);

/** Access the surrounding idle-reset timer. */
export function useIdleReset(): IdleResetContextValue {
  const ctx = useContext(IdleResetContext);
  if (!ctx) throw new Error("useIdleReset must be used within IdleResetProvider");
  return ctx;
}

/** Props for the {@link IdleResetProvider}. */
export interface IdleResetProviderProps {
  /** Idle window before {@link onIdle} fires. */
  timeoutMs: number;
  /**
   * Fires after `timeoutMs` without any touch. The app discards in-progress
   * input/capture state and returns to the standby screen here — no personal
   * data may survive on an unattended device.
   */
  onIdle: () => void;
  /** Disable the timer (standby screen itself). Defaults to `true`. */
  enabled?: boolean;
  children: ReactNode;
}

/**
 * Global no-input reset timer for unattended devices. Every touch anywhere in
 * the subtree restarts the window; when it elapses, `onIdle` fires so the
 * app can discard state and return to standby.
 *
 * The touch listener observes via the capture phase without claiming the
 * responder, so normal touch handling is unaffected.
 */
export function IdleResetProvider({
  timeoutMs,
  onIdle,
  enabled = true,
  children,
}: IdleResetProviderProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    if (!enabled) return;
    timer.current = setTimeout(() => {
      onIdleRef.current();
    }, timeoutMs);
  }, [clear, enabled, timeoutMs]);

  useEffect(() => {
    reset();
    return clear;
  }, [reset, clear]);

  const value = useMemo<IdleResetContextValue>(
    () => ({ reset, pause: clear }),
    [reset, clear],
  );

  return (
    <IdleResetContext.Provider value={value}>
      <View
        className="flex-1"
        onStartShouldSetResponderCapture={() => {
          reset();
          return false;
        }}
        onMoveShouldSetResponderCapture={() => {
          reset();
          return false;
        }}
      >
        {children}
      </View>
    </IdleResetContext.Provider>
  );
}
