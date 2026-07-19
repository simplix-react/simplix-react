import { removeToast, useToastStore, type Toast } from "@simplix-react/headless";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { STATUS_TONES, type StatusTone } from "./status-tone";

const TOAST_TONE: Record<Toast["type"], StatusTone> = {
  success: "success",
  info: "info",
  warning: "warning",
  error: "danger",
};

/** Props for the {@link ToastHost} component. */
export interface ToastHostProps {
  className?: string;
}

/**
 * Renders the shared toast store (`addToast` from `@simplix-react/headless`)
 * as bottom-anchored, tap-to-dismiss cards. Mount once at the app root —
 * the runtime provider does this automatically.
 */
export function ToastHost({ className }: ToastHostProps) {
  const toasts = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      className={cn("absolute inset-x-0 bottom-0 items-center gap-2 px-4", className)}
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      {toasts.map((toast) => {
        const token = STATUS_TONES[TOAST_TONE[toast.type]];
        return (
          <Pressable
            key={toast.id}
            accessibilityRole="alert"
            onPress={() => removeToast(toast.id)}
            className={cn(
              "w-full max-w-xl flex-row items-center gap-2 rounded-lg border p-3 shadow-md",
              token.surface,
            )}
          >
            <View className={cn("h-2 w-2 rounded-full", token.dot)} />
            <Text size="sm" className={cn("flex-1", token.surfaceText)}>
              {toast.message}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
