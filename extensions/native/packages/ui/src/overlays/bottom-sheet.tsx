import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Heading } from "../primitives/heading";
import { cn } from "../utils/cn";

const DISMISS_DRAG_DISTANCE = 80;
const OPEN_DURATION_MS = 240;
const CLOSE_DURATION_MS = 180;

/** Props for the {@link BottomSheet} component. */
export interface BottomSheetProps {
  /** Controlled visibility. */
  open: boolean;
  /** Called when the user dismisses the sheet (backdrop tap, drag down). */
  onClose: () => void;
  /** Title row rendered above the content. */
  title?: string;
  /** Max sheet height as a fraction of the window height. Defaults to `0.85`. */
  maxHeightFraction?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * Bottom sheet — the default interaction surface of the mobile kit
 * (pickers, filters, menus). Slide-up animation, drag-handle dismissal,
 * backdrop tap to close, keyboard avoidance for embedded inputs.
 *
 * @example
 * ```tsx
 * <BottomSheet open={open} onClose={() => setOpen(false)} title="Filters">
 *   <FilterForm />
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onClose,
  title,
  maxHeightFraction = 0.85,
  children,
  className,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(open);
  const translateY = useRef(new Animated.Value(Dimensions.get("window").height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: Dimensions.get("window").height,
        duration: CLOSE_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      translateY.setValue(Dimensions.get("window").height);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: OPEN_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (visible) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_evt, gesture) => {
          if (gesture.dy > 0) translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dy > DISMISS_DRAG_DISTANCE) {
            close();
          } else {
            Animated.timing(translateY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY, close],
  );

  if (!visible) return null;

  const maxHeight = Dimensions.get("window").height * maxHeightFraction;

  return (
    <Modal transparent visible={visible} onRequestClose={close} animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable accessibilityLabel="Close" className="flex-1" onPress={close} />
        </Animated.View>
        <Animated.View
          className={cn("rounded-t-2xl bg-card shadow-lg", className)}
          style={{ transform: [{ translateY }], maxHeight, paddingBottom: insets.bottom }}
        >
          <View {...panResponder.panHandlers} className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-border-strong" />
          </View>
          {title ? (
            <View className="border-b border-border px-4 pb-3">
              <Heading level={5}>{title}</Heading>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
