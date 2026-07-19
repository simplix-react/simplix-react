import { create as createQr, type QRCodeErrorCorrectionLevel } from "qrcode";

/** A rendered QR matrix: square bitmap of dark modules. */
export interface QrMatrix {
  /** Modules per side. */
  size: number;
  /** Row-major dark-module flags (`size * size` entries). */
  modules: boolean[];
}

/**
 * Build the QR module matrix for a value (pure — shared by the SVG renderer
 * and tests).
 */
export function buildQrMatrix(
  value: string,
  errorCorrectionLevel: QRCodeErrorCorrectionLevel = "M",
): QrMatrix {
  const qr = createQr(value, { errorCorrectionLevel });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const modules: boolean[] = new Array(size * size);
  for (let i = 0; i < size * size; i++) {
    modules[i] = data[i] === 1;
  }
  return { size, modules };
}

/**
 * Convert a QR matrix into a single SVG path string (one `M…h1v1h-1z` cell
 * per dark module, unit grid) — rendered inside an `<Svg>` scaled viewBox.
 */
export function qrMatrixToPath(matrix: QrMatrix): string {
  const segments: string[] = [];
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (matrix.modules[row * matrix.size + col]) {
        segments.push(`M${col} ${row}h1v1h-1z`);
      }
    }
  }
  return segments.join("");
}
