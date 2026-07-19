import { CameraView, useCameraPermissions } from "expo-camera";
import type { ComponentRef, ReactNode, RefObject } from "react";
import { View } from "react-native";

import { cn } from "@simplix-react-native/ui";

/** Imperative camera handle (take pictures via `takePictureAsync`). */
export type CameraPreviewHandle = ComponentRef<typeof CameraView>;

/** Props for the {@link CameraPreview} component. */
export interface CameraPreviewProps {
  /** Ref receiving the camera handle for `takePictureAsync`. */
  cameraRef?: RefObject<CameraPreviewHandle | null>;
  /** Camera facing. Defaults to `"front"` (arrival photos). */
  facing?: "front" | "back";
  /** Overlay content (guide frame, countdown) rendered above the preview. */
  children?: ReactNode;
  /** Fires once the native camera is ready to capture. */
  onCameraReady?: () => void;
  /** Mirror the preview horizontally. Defaults to `true` for the front camera. */
  mirror?: boolean;
  className?: string;
}

export { useCameraPermissions };

/**
 * Camera preview surface for the capture session. Permission handling stays
 * with the screen (`useCameraPermissions` is re-exported) so the flow can
 * skip photography entirely when the camera is unavailable — the capture is
 * then recorded as photo-less for the desk to notice.
 */
export function CameraPreview({
  cameraRef,
  facing = "front",
  children,
  onCameraReady,
  mirror,
  className,
}: CameraPreviewProps) {
  return (
    <View className={cn("flex-1 overflow-hidden bg-black", className)}>
      <CameraView
        ref={cameraRef}
        facing={facing}
        mirror={mirror ?? facing === "front"}
        onCameraReady={onCameraReady}
        style={{ flex: 1 }}
      />
      {children ? <View className="absolute inset-0">{children}</View> : null}
    </View>
  );
}
