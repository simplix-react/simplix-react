
import * as React from 'react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { ToolbarButton, type ToolbarButtonProps } from './toolbar'

export interface MarkToolbarButtonProps extends Omit<ToolbarButtonProps, 'pressed'> {
  /** The mark type to toggle (e.g., 'bold', 'italic') */
  nodeType: string
}

/**
 * Toolbar button for toggling text marks (bold, italic, etc.)
 */
export const MarkToolbarButton = React.forwardRef<HTMLButtonElement, MarkToolbarButtonProps>(
  ({ nodeType, children, ...props }, ref) => {
    const editor = useEditorRef()
    const pressed = useEditorSelector(
      (editor) => !!editor.api.hasMark(nodeType),
      [nodeType]
    )

    return (
      <ToolbarButton
        ref={ref}
        pressed={pressed}
        onClick={() => editor.tf.toggleMark(nodeType)}
        {...props}
      >
        {children}
      </ToolbarButton>
    )
  }
)
MarkToolbarButton.displayName = 'MarkToolbarButton'
