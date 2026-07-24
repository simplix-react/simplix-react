/**
 * A detected face box, normalized to the preview frame (all values `0..1`,
 * origin top-left).
 */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * On-device face detector seam. The framework does not bind a concrete ML Kit
 * library — the app injects one (a react-native-vision-camera frame-processor
 * pushes results into `reportFaces`, a still-image ML Kit detector plugs in
 * through {@link useDetectorPolling}). Detection stays on-device; frames are
 * never sent to a server.
 */
export interface FaceDetectorAdapter {
  /** Detect faces on a captured frame image. */
  detect(imageUri: string): Promise<FaceBox[]>;
}

/** Composition thresholds for the auto-capture judgement. */
export interface CompositionConfig {
  /**
   * Max distance of the face center from the target point per axis
   * (normalized). Defaults to `0.18`.
   */
  centerTolerance?: number;
  /**
   * Normalized X of the point the face should center on. Defaults to `0.5`.
   */
  targetX?: number;
  /**
   * Normalized Y of the point the face should center on. Defaults to `0.5` —
   * lower it when the guide sits near the camera at the top of the screen.
   */
  targetY?: number;
  /** Min face size as a fraction of the frame's larger side. Defaults to `0.18`. */
  minFaceRatio?: number;
  /** Max face size as a fraction of the frame's larger side. Defaults to `0.6`. */
  maxFaceRatio?: number;
}

/** Why the current frame fails the composition judgement. */
export type CompositionFailure = "no-face" | "off-center" | "too-small" | "too-large";

/** Result of {@link evaluateComposition}. */
export interface CompositionResult {
  ok: boolean;
  reason?: CompositionFailure;
  /** The face the judgement was made on (largest detected). */
  face?: FaceBox;
}
