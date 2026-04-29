
import * as React from 'react'
import { Link } from 'lucide-react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { LinkPlugin, triggerFloatingLink } from '@platejs/link/react'
import { ToolbarButton } from './toolbar'

export interface LinkToolbarButtonProps {
  /** Tooltip text */
  tooltip?: string
  /** Additional CSS class */
  className?: string
}

/**
 * Toolbar button for inserting/editing links
 */
export const LinkToolbarButton = React.forwardRef<HTMLButtonElement, LinkToolbarButtonProps>(
  ({ tooltip, className }, ref) => {
    const editor = useEditorRef()
    const pressed = useEditorSelector(
      (editor) => !!editor.api.hasMark(LinkPlugin.key),
      []
    )

    return (
      <ToolbarButton
        ref={ref}
        pressed={pressed}
        tooltip={tooltip}
        className={className}
        onClick={() => triggerFloatingLink(editor, { focused: true })}
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>
    )
  }
)
LinkToolbarButton.displayName = 'LinkToolbarButton'
