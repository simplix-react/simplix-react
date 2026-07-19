import { useEffect, useRef } from "react";

import type { FaceBox, FaceDetectorAdapter } from "./types";

/** Options for {@link useDetectorPolling}. */
export interface UseDetectorPollingOptions {
  /** Still-image face detector supplied by the app. */
  detector: FaceDetectorAdapter;
  /**
   * Grab a low-cost preview frame to feed the detector (e.g. a camera
   * snapshot). Resolves the frame's local URI.
   */
  takeSnapshot: () => Promise<string>;
  /** Feed results into the session (`session.reportFaces`). */
  onFaces: (faces: FaceBox[]) => void;
  /**
   * Called when the detector fails repeatedly — switch the session to manual
   * mode here (`session.enterManualMode`).
   */
  onDetectorFailure?: (error: unknown) => void;
  /** Sampling cadence. Defaults to `800`. */
  intervalMs?: number;
  /** Consecutive failures before {@link onDetectorFailure} fires. Defaults to `3`. */
  failureThreshold?: number;
  /** Pause sampling (e.g. outside the searching/holding phases). */
  enabled?: boolean;
}

/**
 * Pull-model driver for still-image detectors: samples preview frames on an
 * interval, runs the injected detector, and feeds results into the session.
 * Push-model detectors (frame processors) skip this and call
 * `session.reportFaces` directly.
 */
export function useDetectorPolling(options: UseDetectorPollingOptions): void {
  const {
    detector,
    takeSnapshot,
    onFaces,
    onDetectorFailure,
    intervalMs = 800,
    failureThreshold = 3,
    enabled = true,
  } = options;

  const failures = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const sample = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const frameUri = await takeSnapshot();
        const faces = await detector.detect(frameUri);
        if (!cancelled) {
          failures.current = 0;
          onFaces(faces);
        }
      } catch (error) {
        if (!cancelled) {
          failures.current += 1;
          if (failures.current >= failureThreshold) {
            onDetectorFailure?.(error);
          }
        }
      } finally {
        busy.current = false;
      }
    };

    const timer = setInterval(() => void sample(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [detector, takeSnapshot, onFaces, onDetectorFailure, intervalMs, failureThreshold, enabled]);
}
