import { Button, Heading, Text, cn } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { View } from "react-native";

import type { AutoCapturePhase } from "./use-auto-capture-session";
import type { CompositionFailure } from "./types";

/** Props for the {@link GuideFrame} overlay. */
export interface GuideFrameProps {
  phase: AutoCapturePhase;
  countdown: number | null;
  failure: CompositionFailure | null;
  /** Manual capture trigger, shown in manual mode. */
  onCaptureNow?: () => void;
  className?: string;
}

const FAILURE_KEY: Record<CompositionFailure, string> = {
  "no-face": "noFace",
  "off-center": "offCenter",
  "too-small": "tooSmall",
  "too-large": "tooLarge",
};

/**
 * Capture overlay: face guide frame, phase/status guidance, 3-2-1 countdown,
 * and the manual capture button in fallback mode.
 */
export function GuideFrame({
  phase,
  countdown,
  failure,
  onCaptureNow,
  className,
}: GuideFrameProps) {
  const { t } = useTranslation("simplix/native-capture");

  const statusText =
    phase === "manual"
      ? t("manualHint")
      : phase === "holding"
        ? t("holding")
        : phase === "countdown"
          ? t("countdown", { count: countdown ?? 0 })
          : failure
            ? t(FAILURE_KEY[failure])
            : t("searching");

  return (
    <View className={cn("flex-1 items-center justify-between p-6", className)}>
      <View />
      <View
        pointerEvents="none"
        className={cn(
          "aspect-[3/4] w-3/5 max-w-80 rounded-[999px] border-4",
          phase === "holding" || phase === "countdown"
            ? "border-emerald-400"
            : "border-white/80",
        )}
      >
        {phase === "countdown" && countdown !== null ? (
          <View className="flex-1 items-center justify-center">
            <Heading level={1} className="text-7xl text-white">
              {String(countdown)}
            </Heading>
          </View>
        ) : null}
      </View>
      <View className="w-full items-center gap-4 pb-2">
        <View className="rounded-full bg-black/60 px-5 py-2.5">
          <Text size="lg" className="text-center text-white">
            {statusText}
          </Text>
        </View>
        {phase === "manual" && onCaptureNow ? (
          <Button size="touch" onPress={onCaptureNow}>
            {t("capture")}
          </Button>
        ) : null}
      </View>
    </View>
  );
}
