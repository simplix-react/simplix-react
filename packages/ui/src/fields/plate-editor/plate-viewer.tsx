import { lazy, Suspense } from 'react'
import type { Value } from 'platejs'

export { plateValueToText } from '../shared/plate-editor-helpers'

export type PlateViewerVariant = 'basic' | 'standard' | 'advanced'

export interface PlateViewerProps {
  /** Persisted editor value: the serialized JSON string (or plain text), or a parsed value. */
  value: string | Value | null | undefined
  /** Plugin set matching the editor variant the value was authored with. */
  variant?: PlateViewerVariant
  className?: string
}

const LazyViewer = lazy(() =>
  import('./plate-viewer-impl').then((m) => ({ default: m.PlateViewerImpl })),
)

/**
 * Read-only renderer for persisted plate editor content (detail panels,
 * previews). Renders without toolbar, border, or minimum height; plain-text
 * values render as one paragraph per line.
 *
 * The Plate runtime is heavy, so the actual renderer is code-split and loads
 * on first mount — screens without rich-text content never fetch it.
 */
export function PlateViewer(props: PlateViewerProps) {
  return (
    <Suspense fallback={null}>
      <LazyViewer {...props} />
    </Suspense>
  )
}
