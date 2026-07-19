import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { evaluateComposition } from "./composition";
import type {
  CompositionConfig,
  CompositionFailure,
  FaceBox,
} from "./types";

/** Phase of the auto-capture session. */
export type AutoCapturePhase =
  | "searching"
  | "holding"
  | "countdown"
  | "capturing"
  | "captured"
  | "manual";

/** Options for {@link useAutoCaptureSession}. */
export interface UseAutoCaptureSessionOptions extends CompositionConfig {
  /**
   * Take the actual photo (typically `cameraRef.current.takePictureAsync`)
   * and resolve its local URI.
   */
  takePhoto: () => Promise<string>;
  /** How long the composition must hold before the countdown. Defaults to `1000`. */
  sustainMs?: number;
  /** Countdown start value. Defaults to `3` (3-2-1). */
  countdownFrom?: number;
  /** Countdown tick length. Defaults to `1000`. */
  countdownTickMs?: number;
  /** Called with the photo URI after a successful capture. */
  onCaptured?: (photoUri: string) => void;
  /** Called when `takePhoto` fails (camera hardware error). */
  onCaptureError?: (error: unknown) => void;
}

/** State returned by {@link useAutoCaptureSession}. */
export interface UseAutoCaptureSessionResult {
  phase: AutoCapturePhase;
  /** Remaining countdown value while `phase === "countdown"`. */
  countdown: number | null;
  /** Captured photo URI while `phase === "captured"`. */
  photoUri: string | null;
  /** Why the last judged frame failed composition (guides the overlay text). */
  failure: CompositionFailure | null;
  /**
   * Feed detected faces (normalized boxes) from whatever detector the app
   * wired. Ignored in `manual` / `capturing` / `captured` phases.
   */
  reportFaces: (faces: FaceBox[]) => void;
  /** Trigger a capture immediately (manual button, fallback mode). */
  captureNow: () => void;
  /** Discard the captured photo and return to searching (retake). */
  retake: () => void;
  /**
   * Switch to manual mode — the documented fallback when no detector is
   * available or its model failed to load. Auto judgement stops;
   * `captureNow` drives the session.
   */
  enterManualMode: () => void;
}

/**
 * Auto-capture session state machine: composition judgement (centered face at
 * proper size), sustain window, 3-2-1 countdown, capture, retake, and the
 * manual fallback. Detector-agnostic — faces arrive through
 * {@link UseAutoCaptureSessionResult.reportFaces}.
 */
export function useAutoCaptureSession(
  options: UseAutoCaptureSessionOptions,
): UseAutoCaptureSessionResult {
  const {
    takePhoto,
    sustainMs = 1000,
    countdownFrom = 3,
    countdownTickMs = 1000,
    onCaptured,
    onCaptureError,
    centerTolerance,
    minFaceRatio,
    maxFaceRatio,
  } = options;

  const [phase, setPhase] = useState<AutoCapturePhase>("searching");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [failure, setFailure] = useState<CompositionFailure | null>(null);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const holdStartedAt = useRef<number | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const compositionConfig = useMemo(
    () => ({ centerTolerance, minFaceRatio, maxFaceRatio }),
    [centerTolerance, minFaceRatio, maxFaceRatio],
  );

  const clearCountdown = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  }, []);

  const capture = useCallback(() => {
    clearCountdown();
    holdStartedAt.current = null;
    setPhase("capturing");
    takePhoto()
      .then((uri) => {
        setPhotoUri(uri);
        setPhase("captured");
        onCaptured?.(uri);
      })
      .catch((error: unknown) => {
        // A hardware/camera failure returns the session to searching; the
        // screen decides whether to skip the photo entirely (desk notice).
        setPhase(phaseRef.current === "manual" ? "manual" : "searching");
        onCaptureError?.(error);
      });
  }, [takePhoto, onCaptured, onCaptureError, clearCountdown]);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(countdownFrom);
    countdownTimer.current = setInterval(() => {
      setCountdown((current) => {
        if (current === null) return current;
        if (current <= 1) {
          capture();
          return null;
        }
        return current - 1;
      });
    }, countdownTickMs);
  }, [countdownFrom, countdownTickMs, capture]);

  const reportFaces = useCallback(
    (faces: FaceBox[]) => {
      const currentPhase = phaseRef.current;
      if (
        currentPhase === "manual" ||
        currentPhase === "capturing" ||
        currentPhase === "captured"
      ) {
        return;
      }

      const result = evaluateComposition(faces, compositionConfig);
      setFailure(result.ok ? null : (result.reason ?? null));

      if (!result.ok) {
        // Composition broke — abort the hold or the countdown.
        holdStartedAt.current = null;
        if (currentPhase === "countdown") clearCountdown();
        if (currentPhase !== "searching") setPhase("searching");
        return;
      }

      if (currentPhase === "countdown") return;

      const now = Date.now();
      if (holdStartedAt.current === null) {
        holdStartedAt.current = now;
        setPhase("holding");
        return;
      }
      if (now - holdStartedAt.current >= sustainMs) {
        startCountdown();
      }
    },
    [compositionConfig, sustainMs, startCountdown, clearCountdown],
  );

  const captureNow = useCallback(() => {
    if (phaseRef.current === "capturing" || phaseRef.current === "captured") return;
    capture();
  }, [capture]);

  const retake = useCallback(() => {
    clearCountdown();
    holdStartedAt.current = null;
    setPhotoUri(null);
    setFailure(null);
    setPhase(phaseRef.current === "manual" ? "manual" : "searching");
  }, [clearCountdown]);

  const enterManualMode = useCallback(() => {
    clearCountdown();
    holdStartedAt.current = null;
    setFailure(null);
    if (phaseRef.current !== "captured") setPhase("manual");
  }, [clearCountdown]);

  useEffect(() => () => clearCountdown(), [clearCountdown]);

  return {
    phase,
    countdown,
    photoUri,
    failure,
    reportFaces,
    captureNow,
    retake,
    enterManualMode,
  };
}
