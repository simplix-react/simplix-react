// Self-registration of the built-in en/ko/ja locale bundle.
import "./locales";

export type {
  FaceBox,
  FaceDetectorAdapter,
  CompositionConfig,
  CompositionFailure,
  CompositionResult,
} from "./types";

export { evaluateComposition } from "./composition";

export { useAutoCaptureSession } from "./use-auto-capture-session";
export type {
  AutoCapturePhase,
  UseAutoCaptureSessionOptions,
  UseAutoCaptureSessionResult,
} from "./use-auto-capture-session";

export { useDetectorPolling } from "./use-detector-polling";
export type { UseDetectorPollingOptions } from "./use-detector-polling";

export { CameraPreview, useCameraPermissions } from "./camera-preview";
export type { CameraPreviewProps, CameraPreviewHandle } from "./camera-preview";

export { GuideFrame } from "./guide-frame";
export type { GuideFrameProps } from "./guide-frame";

export { CapturePreview } from "./capture-preview";
export type { CapturePreviewProps } from "./capture-preview";

export { capturePhotoFormDataPart } from "./form-data";
