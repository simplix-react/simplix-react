import { Button, Text, cn } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";

import { strokeToPath, type StrokePoint } from "./stroke-path";

/** Signature capture method, mirroring the backend's SignatureMethod values. */
export type SignatureCaptureMethod = "drawn" | "typed";

/** Props for the {@link SignaturePad} component. */
export interface SignaturePadProps {
  /** Capture mode: freehand drawing or typed-name rendering. */
  mode: SignatureCaptureMethod;
  /** Rendered name for `mode="typed"`. */
  typedName?: string;
  /**
   * Fires with the captured PNG as a local `file://` URI (FormData-ready),
   * or `null` while the surface is empty. The uploaded payload contract
   * (PNG + method) matches the web `SignaturePad`.
   */
  onChange: (fileUri: string | null) => void;
  /** Capture surface height. Defaults to `200`. */
  height?: number;
  /** Stroke width for drawn mode. Defaults to `3`. */
  strokeWidth?: number;
  /** Ink color. Defaults to near-black. */
  strokeColor?: string;
  className?: string;
}

const CAPTURE_DEBOUNCE_MS = 350;

/**
 * Two-mode signature surface: freehand drawing (touch strokes over SVG) and
 * typed-name rendering. Both export a PNG snapshot of the surface, so the
 * upload path and payload contract stay identical to the web `SignaturePad`.
 *
 * @example
 * ```tsx
 * <SignaturePad mode="drawn" onChange={(uri) => setSignature(uri)} />
 * <SignaturePad mode="typed" typedName={name} onChange={setSignature} />
 * ```
 */
export function SignaturePad({
  mode,
  typedName = "",
  onChange,
  height = 200,
  strokeWidth = 3,
  strokeColor = "#111111",
  className,
}: SignaturePadProps) {
  const { t } = useTranslation("simplix/native-signature");
  const shotRef = useRef<View>(null);
  const [strokes, setStrokes] = useState<string[]>([]);
  const activePoints = useRef<StrokePoint[]>([]);
  const [activePath, setActivePath] = useState<string>("");
  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmpty = mode === "drawn" ? strokes.length === 0 : typedName.trim() === "";

  const scheduleCapture = useCallback(() => {
    if (captureTimer.current) clearTimeout(captureTimer.current);
    captureTimer.current = setTimeout(() => {
      if (!shotRef.current) return;
      captureRef(shotRef, { format: "png", quality: 1, result: "tmpfile" })
        .then((uri) => onChange(uri))
        .catch((error: unknown) => {
          console.error("SignaturePad: capture failed", error);
          onChange(null);
        });
    }, CAPTURE_DEBOUNCE_MS);
  }, [onChange]);

  // Empty surface → null; content → snapshot after the debounce window.
  useEffect(() => {
    if (isEmpty) {
      if (captureTimer.current) clearTimeout(captureTimer.current);
      onChange(null);
      return;
    }
    scheduleCapture();
    // typedName drives typed-mode content; strokes drive drawn-mode content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmpty, typedName, strokes]);

  useEffect(
    () => () => {
      if (captureTimer.current) clearTimeout(captureTimer.current);
    },
    [],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => mode === "drawn",
        onMoveShouldSetPanResponder: () => mode === "drawn",
        onPanResponderGrant: (event) => {
          activePoints.current = [
            { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY },
          ];
          setActivePath(strokeToPath(activePoints.current));
        },
        onPanResponderMove: (event) => {
          activePoints.current.push({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
          setActivePath(strokeToPath(activePoints.current));
        },
        onPanResponderRelease: () => {
          const path = strokeToPath(activePoints.current);
          activePoints.current = [];
          setActivePath("");
          if (path) setStrokes((prev) => [...prev, path]);
        },
      }),
    [mode],
  );

  const clear = () => {
    setStrokes([]);
    setActivePath("");
    activePoints.current = [];
  };

  return (
    <View className={cn("gap-2", className)}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
        <View
          {...(mode === "drawn" ? panResponder.panHandlers : {})}
          className="items-center justify-center overflow-hidden rounded-md border border-border bg-white"
          style={{ height }}
        >
          {mode === "drawn" ? (
            <Svg width="100%" height="100%">
              {strokes.map((d, index) => (
                <Path
                  key={index}
                  d={d}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {activePath ? (
                <Path
                  d={activePath}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null}
            </Svg>
          ) : typedName.trim() ? (
            <Text
              // lineHeight and padding keep tall or slanted glyphs (Hangul,
              // ascenders) from clipping at the preview bounds.
              style={{
                fontSize: 40,
                lineHeight: 56,
                paddingHorizontal: 12,
                fontStyle: "italic",
                color: strokeColor,
              }}
              numberOfLines={1}
            >
              {typedName.trim()}
            </Text>
          ) : (
            <Text size="sm" tone="muted">
              {t("typedPreviewEmpty")}
            </Text>
          )}
        </View>
      </ViewShot>
      {mode === "drawn" ? (
        <View className="flex-row items-center justify-between">
          <Text size="caption" tone="muted">
            {t("drawHint")}
          </Text>
          <Button variant="ghost" size="sm" onPress={clear} disabled={isEmpty}>
            {t("clear")}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Build the multipart form-data part for a captured signature PNG —
 * matches the web upload payload (`image/png` file part).
 */
export function signatureFormDataPart(
  fileUri: string,
  fileName = "signature.png",
): { uri: string; name: string; type: string } {
  return { uri: fileUri, name: fileName, type: "image/png" };
}
