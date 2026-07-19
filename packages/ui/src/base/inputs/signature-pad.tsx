import { useCallback, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

/** Props for the {@link SignaturePad} component. */
export interface SignaturePadProps {
  /**
   * Capture mode: `drawn` opens a freehand canvas (finger / stylus / mouse),
   * `typed` renders {@link SignaturePadProps.typedName} in a script typeface.
   */
  mode: "drawn" | "typed";
  /** Name rendered as the signature in `typed` mode. */
  typedName?: string;
  /**
   * Fires with the captured signature as a PNG data URL, or `null` while the
   * pad is empty (nothing drawn / blank typed name).
   */
  onChange?: (dataUrl: string | null) => void;
  /** Canvas height in CSS pixels; defaults to 160. The width tracks the container. */
  height?: number;
  disabled?: boolean;
  className?: string;
}

const TYPED_FONT = '48px "Segoe Script", "Savoye LET", "Snell Roundhand", cursive';
const STROKE_STYLE = "#1f2937";
const STROKE_WIDTH = 2.5;

/**
 * Signature capture surface with two modes: freehand drawing on a canvas and a
 * typed name rendered in a signature typeface. Either mode reports the result
 * as a PNG data URL through `onChange`, so submit paths upload one format
 * regardless of how the signature was captured.
 *
 * @example
 * ```tsx
 * <SignaturePad mode="drawn" onChange={setSignatureDataUrl} />
 * <SignaturePad mode="typed" typedName={name} onChange={setSignatureDataUrl} />
 * ```
 */
export function SignaturePad({
  mode,
  typedName,
  onChange,
  height = 160,
  disabled,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasStrokesRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    hasStrokesRef.current = false;
  }, [height]);

  const clear = useCallback(() => {
    resetCanvas();
    onChangeRef.current?.(null);
  }, [resetCanvas]);

  // Mode/size changes start from a blank surface; typed mode re-renders the name.
  useEffect(() => {
    resetCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (mode === "typed") {
      const trimmed = typedName?.trim();
      if (!trimmed) {
        onChangeRef.current?.(null);
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) return;
      context.font = TYPED_FONT;
      context.fillStyle = STROKE_STYLE;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(trimmed, canvas.clientWidth / 2, height / 2);
      onChangeRef.current?.(canvas.toDataURL("image/png"));
    } else {
      onChangeRef.current?.(null);
    }
  }, [mode, typedName, height, resetCanvas]);

  const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || mode !== "drawn") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const { x, y } = pointerPosition(event);
    context.strokeStyle = STROKE_STYLE;
    context.lineWidth = STROKE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(x, y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const { x, y } = pointerPosition(event);
    context.lineTo(x, y);
    context.stroke();
    hasStrokesRef.current = true;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (hasStrokesRef.current) {
      onChangeRef.current?.(event.currentTarget.toDataURL("image/png"));
    }
  };

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full rounded-md border border-input bg-white",
          mode === "drawn" && !disabled && "cursor-crosshair touch-none",
          disabled && "opacity-50",
        )}
        style={{ height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {mode === "drawn" && !disabled ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ⟲
        </button>
      ) : null}
    </div>
  );
}
