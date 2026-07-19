import { useEffect, useMemo } from 'react'
import { Plate, usePlateEditor } from 'platejs/react'
import type { Value } from 'platejs'

import { cn } from '../../utils/cn'
import { parsePlateValue } from '../shared/plate-editor-helpers'
import { EMPTY_EDITOR_VALUE } from './types'
import { Editor } from './components/editor-container'
import { BasicMarksKit } from './plugins/basic-marks-kit'
import { BasicBlocksKit } from './plugins/basic-blocks-kit'
import { ListKit } from './plugins/list-kit'
import { LinkKit } from './plugins/link-kit'
import { CodeBlockKit } from './plugins/code-block-kit'
import { MediaKit } from './plugins/media-kit'
import { FontStylesKit } from './plugins/font-styles-kit'
import { TableKit } from './plugins/table-kit'

export type PlateViewerVariant = 'basic' | 'standard' | 'advanced'

const PLUGINS_BY_VARIANT = {
  basic: [...BasicMarksKit, ...BasicBlocksKit, ...ListKit, ...LinkKit],
  standard: [...BasicMarksKit, ...BasicBlocksKit, ...ListKit, ...LinkKit, ...CodeBlockKit, ...MediaKit],
  advanced: [...BasicMarksKit, ...BasicBlocksKit, ...ListKit, ...LinkKit, ...CodeBlockKit, ...FontStylesKit, ...TableKit],
}

export interface PlateViewerProps {
  /** Persisted editor value: the serialized JSON string (or plain text), or a parsed value. */
  value: string | Value | null | undefined
  /** Plugin set matching the editor variant the value was authored with. */
  variant?: PlateViewerVariant
  className?: string
}

/**
 * Read-only renderer for persisted plate editor content (detail panels,
 * previews). Renders without toolbar, border, or minimum height; plain-text
 * values render as one paragraph per line.
 */
export function PlateViewer({ value, variant = 'basic', className }: PlateViewerProps) {
  const parsed = useMemo<Value>(
    () => (typeof value === 'string' || value == null ? parsePlateValue(value, EMPTY_EDITOR_VALUE) : value),
    [value],
  )

  const editor = usePlateEditor({
    plugins: PLUGINS_BY_VARIANT[variant],
    value: parsed,
  })

  // Detail panels swap records without remounting; push the new value into the editor.
  useEffect(() => {
    editor.tf.setValue(parsed)
  }, [editor, parsed])

  return (
    <Plate editor={editor} readOnly>
      <Editor readOnly className={cn('p-0', className)} />
    </Plate>
  )
}
