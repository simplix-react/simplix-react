import { Linking, Pressable } from "react-native";

import { Text } from "../primitives/text";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link LinkField}. */
export interface LinkFieldProps extends CommonDetailFieldProps {
  /** Display text of the link. */
  value?: string | null;
  /** Target URL; defaults to `value`. */
  href?: string;
  /** Custom handler; overrides opening the URL. */
  onPress?: () => void;
}

/** Read-only tappable link row (opens the URL or runs `onPress`). */
export function LinkField({ value, href, onPress, ...rest }: LinkFieldProps) {
  const target = href ?? value ?? undefined;
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (target) {
      // Fire-and-forget: an unopenable URL surfaces through the OS, not a crash.
      void Linking.openURL(target).catch(() => {});
    }
  };

  return (
    <DetailField {...rest}>
      {value ? (
        <Pressable accessibilityRole="link" onPress={handlePress}>
          <Text size="base" tone="primary" className="underline">
            {value}
          </Text>
        </Pressable>
      ) : null}
    </DetailField>
  );
}
