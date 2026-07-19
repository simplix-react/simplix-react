import { Button, cn } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { Image, View } from "react-native";

/** Props for the {@link CapturePreview} component. */
export interface CapturePreviewProps {
  /** Captured photo URI. */
  photoUri: string;
  /** Discard and return to the capture surface. */
  onRetake: () => void;
  /** Confirm this photo for upload. */
  onUse: () => void;
  /** Disable actions while the upload is in flight. */
  busy?: boolean;
  className?: string;
}

/** Post-capture review: the photo with retake / use-this-photo actions. */
export function CapturePreview({
  photoUri,
  onRetake,
  onUse,
  busy,
  className,
}: CapturePreviewProps) {
  const { t } = useTranslation("simplix/native-capture");

  return (
    <View className={cn("flex-1 bg-black", className)}>
      <Image
        source={{ uri: photoUri }}
        accessibilityIgnoresInvertColors
        className="flex-1"
        resizeMode="contain"
      />
      <View className="flex-row gap-3 p-4">
        <Button
          variant="outline"
          size="touch"
          className="flex-1"
          disabled={busy}
          onPress={onRetake}
        >
          {t("retake")}
        </Button>
        <Button size="touch" className="flex-1" loading={busy} onPress={onUse}>
          {t("usePhoto")}
        </Button>
      </View>
    </View>
  );
}
