import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../utils/cn";

/** Props for the {@link Screen} page root. */
export interface ScreenProps {
  /** Wrap content in a vertical `ScrollView`. Defaults to `true`. */
  scroll?: boolean;
  /** Apply standard content padding. Defaults to `true`. */
  padded?: boolean;
  /** Wrap in `KeyboardAvoidingView` (forms). Defaults to `false`. */
  keyboardAvoiding?: boolean;
  /** Root class names. */
  className?: string;
  /** Scroll content container class names. */
  contentClassName?: string;
  children?: ReactNode;
}

/**
 * Page root of the mobile grammar. The expo-router stack header owns the
 * title and actions; `Screen` owns background, safe-area bottom inset, and
 * the scroll/keyboard behavior of the content area.
 *
 * @example
 * ```tsx
 * export default function ProfileScreen() {
 *   return (
 *     <Screen>
 *       <Section title="Profile">…</Section>
 *     </Screen>
 *   );
 * }
 * ```
 */
export function Screen({
  scroll = true,
  padded = true,
  keyboardAvoiding = false,
  className,
  contentClassName,
  children,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={cn(padded && "p-4", contentClassName)}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      className="flex-1"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={cn("flex-1", padded && "p-4", contentClassName)}
      style={{ paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return <View className={cn("flex-1 bg-background", className)}>{content}</View>;
}
