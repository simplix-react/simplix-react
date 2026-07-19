import { useMemo, useRef, type ReactNode } from "react";
import { Animated, PanResponder, Pressable, View } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

const ACTION_WIDTH = 84;
const OPEN_THRESHOLD = 0.5;

/** A swipe-revealed row action. */
export interface SwipeAction {
  key: string;
  label: string;
  /** Destructive actions render on the destructive surface. */
  tone?: "default" | "destructive";
  /** Receives a `close` callback to retract the row after acting. */
  onPress: (close: () => void) => void;
}

/** Props for the {@link SwipeableRow} component. */
export interface SwipeableRowProps {
  /** Actions revealed by swiping left. Empty renders children untouched. */
  actions: SwipeAction[];
  children: ReactNode;
  className?: string;
}

/**
 * Left-swipe row revealing trailing actions — implemented on core
 * `PanResponder` + `Animated` (no gesture-handler dependency).
 */
export function SwipeableRow({ actions, children, className }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);
  const actionsWidth = actions.length * ACTION_WIDTH;

  const close = useMemo(
    () => () => {
      offset.current = 0;
      Animated.timing(translateX, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
    },
    [translateX],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          actions.length > 0 &&
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderMove: (_evt, gesture) => {
          const next = Math.min(0, Math.max(-actionsWidth, offset.current + gesture.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_evt, gesture) => {
          const position = Math.min(
            0,
            Math.max(-actionsWidth, offset.current + gesture.dx),
          );
          const shouldOpen = position < -actionsWidth * OPEN_THRESHOLD;
          offset.current = shouldOpen ? -actionsWidth : 0;
          Animated.timing(translateX, {
            toValue: offset.current,
            duration: 160,
            useNativeDriver: true,
          }).start();
        },
      }),
    [actions.length, actionsWidth, translateX],
  );

  if (actions.length === 0) {
    return <View className={className}>{children}</View>;
  }

  return (
    <View className={cn("overflow-hidden", className)}>
      <View className="absolute inset-y-0 right-0 flex-row">
        {actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            onPress={() => action.onPress(close)}
            className={cn(
              "items-center justify-center",
              action.tone === "destructive" ? "bg-destructive" : "bg-surface-3",
            )}
            style={{ width: ACTION_WIDTH }}
          >
            <Text
              size="sm"
              className={cn(
                "font-medium",
                action.tone === "destructive"
                  ? "text-destructive-foreground"
                  : "text-foreground",
              )}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
