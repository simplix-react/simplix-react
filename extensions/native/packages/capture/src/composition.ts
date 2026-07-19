import type {
  CompositionConfig,
  CompositionResult,
  FaceBox,
} from "./types";

const DEFAULTS: Required<CompositionConfig> = {
  centerTolerance: 0.18,
  minFaceRatio: 0.18,
  maxFaceRatio: 0.6,
};

/**
 * Judge whether the detected faces satisfy the auto-capture composition:
 * the largest face centered within tolerance and sized within the ratio
 * band. Pure — shared by the session hook and tests.
 */
export function evaluateComposition(
  faces: FaceBox[],
  config?: CompositionConfig,
): CompositionResult {
  const { centerTolerance, minFaceRatio, maxFaceRatio } = {
    ...DEFAULTS,
    ...config,
  };

  if (faces.length === 0) return { ok: false, reason: "no-face" };

  const face = faces.reduce((largest, candidate) =>
    candidate.width * candidate.height > largest.width * largest.height
      ? candidate
      : largest,
  );

  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  if (
    Math.abs(centerX - 0.5) > centerTolerance ||
    Math.abs(centerY - 0.5) > centerTolerance
  ) {
    return { ok: false, reason: "off-center", face };
  }

  const ratio = Math.max(face.width, face.height);
  if (ratio < minFaceRatio) return { ok: false, reason: "too-small", face };
  if (ratio > maxFaceRatio) return { ok: false, reason: "too-large", face };

  return { ok: true, face };
}
