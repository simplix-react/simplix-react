/** A single freehand stroke as captured touch points. */
export interface StrokePoint {
  x: number;
  y: number;
}

/**
 * Convert captured stroke points into a smoothed SVG path using quadratic
 * segments through midpoints (pure — shared by the pad and tests).
 */
export function strokeToPath(points: StrokePoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    // A tap renders as a dot (tiny closed segment).
    const { x, y } = points[0];
    return `M${x} ${y}l0.1 0.1`;
  }
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += `Q${points[i].x} ${points[i].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += `L${last.x} ${last.y}`;
  return d;
}
