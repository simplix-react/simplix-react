import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { cn } from "../../utils/cn";

/** Props for the {@link QrCode} component. */
export interface QrCodeProps {
  /** Payload encoded into the QR symbol. */
  value: string;
  /** Rendered edge length in CSS pixels; defaults to 192. */
  size?: number;
  /** Error-correction level; defaults to `M`. */
  level?: "L" | "M" | "Q" | "H";
  /** Accessible label announced for the symbol. */
  label?: string;
  className?: string;
}

/**
 * Renders a QR symbol for an arbitrary payload onto a canvas. Re-encodes
 * whenever the payload changes, so rotating tokens (e.g. a kiosk presence QR)
 * update in place without remounting.
 *
 * @example
 * ```tsx
 * <QrCode value={presenceUrl} size={240} />
 * ```
 */
export function QrCode({ value, size = 192, level = "M", label, className }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    // The qrcode renderer resizes the canvas backing store itself; width covers
    // both dimensions because QR symbols are square.
    void QRCode.toCanvas(canvas, value, {
      width: size,
      errorCorrectionLevel: level,
      margin: 1,
    });
  }, [value, size, level]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={cn("rounded-md bg-white", className)}
      style={{ width: size, height: size }}
    />
  );
}
