import { useEffect, useRef } from "react";
import { Animated, type ViewProps } from "react-native";

import { cn } from "../utils/cn";

/** Props for the {@link Skeleton} component. */
export interface SkeletonProps extends ViewProps {
  className?: string;
}

/** Loading placeholder block with an opacity pulse. */
export function Skeleton({ className, style, ...rest }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={cn("h-4 rounded-md bg-muted", className)}
      style={[{ opacity }, style]}
      {...rest}
    />
  );
}
