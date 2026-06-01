export interface UploadProgressBarProps {
  /** Progress value 0-100. */
  value: number
  showPct?: boolean
}

/**
 * Upload progress bar atom.
 *
 * ★ UD-3/FX-1: Uses own fill <div className="bg-primary"> — NO generic Progress primitive.
 * Track height is 3px (hardcoded — no token equivalent, plan §5.4).
 */
export function UploadProgressBar({ value, showPct }: UploadProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className="flex items-center gap-2.5">
      {/* Track — 3px height hardcoded (no token) */}
      <div
        className="flex-1 overflow-hidden rounded-full bg-muted"
        style={{ height: 3 }}
      >
        {/* Fill div — bg-primary, no Progress primitive (UD-3) */}
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showPct && (
        <span className="text-[10.5px] tabular-nums text-muted-foreground">
          {pct}%
        </span>
      )}
    </div>
  )
}
