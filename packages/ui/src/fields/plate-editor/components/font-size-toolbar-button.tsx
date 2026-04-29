
import * as React from 'react'
import { AArrowUp, AArrowDown } from 'lucide-react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { KEYS } from 'platejs'

import { ToolbarButton } from './toolbar'
import { FONT_SIZES } from '../plugins/font-styles-kit'

export interface FontSizeToolbarButtonProps {
  increaseTooltip?: string
  decreaseTooltip?: string
}

/**
 * Toolbar buttons for increasing/decreasing font size
 */
export function FontSizeToolbarButton({
  increaseTooltip,
  decreaseTooltip,
}: FontSizeToolbarButtonProps) {
  const editor = useEditorRef()

  const currentFontSize = useEditorSelector(
    (editor) => (editor.api.mark(KEYS.fontSize) as string) || '16px',
    []
  )

  // Get current size index in the FONT_SIZES array
  const getCurrentSizeIndex = React.useCallback(() => {
    const index = FONT_SIZES.findIndex((s) => s.value === currentFontSize)
    return index >= 0 ? index : FONT_SIZES.findIndex((s) => s.value === '16px')
  }, [currentFontSize])

  const handleIncrease = React.useCallback(() => {
    const currentIndex = getCurrentSizeIndex()
    const nextIndex = Math.min(currentIndex + 1, FONT_SIZES.length - 1)
    if (editor.selection) {
      editor.tf.addMarks({ [KEYS.fontSize]: FONT_SIZES[nextIndex].value })
      editor.tf.focus()
    }
  }, [editor, getCurrentSizeIndex])

  const handleDecrease = React.useCallback(() => {
    const currentIndex = getCurrentSizeIndex()
    const prevIndex = Math.max(currentIndex - 1, 0)
    if (editor.selection) {
      editor.tf.addMarks({ [KEYS.fontSize]: FONT_SIZES[prevIndex].value })
      editor.tf.focus()
    }
  }, [editor, getCurrentSizeIndex])

  return (
    <>
      <ToolbarButton tooltip={decreaseTooltip} onClick={handleDecrease}>
        <AArrowDown className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton tooltip={increaseTooltip} onClick={handleIncrease}>
        <AArrowUp className="h-4 w-4" />
      </ToolbarButton>
    </>
  )
}
