
import { List, ListOrdered } from 'lucide-react'
import { BulletedListPlugin, NumberedListPlugin } from '@platejs/list-classic/react'
import { toggleList } from '@platejs/list-classic'
import { useEditorRef, useEditorSelector } from 'platejs/react'

import { ToolbarButton } from './toolbar'

interface ListToolbarButtonProps {
  nodeType: 'ul' | 'ol'
  tooltip?: string
}

export function ListToolbarButton({ nodeType, tooltip }: ListToolbarButtonProps) {
  const editor = useEditorRef()
  const pluginKey = nodeType === 'ul' ? BulletedListPlugin.key : NumberedListPlugin.key

  const pressed = useEditorSelector(
    (editor) => {
      if (!editor.selection) return false
      const [block] = editor.api.block() ?? []
      if (!block) return false
      // Check if current block or parent is a list of this type
      const listEntry = editor.api.parent(editor.api.block()?.[1] ?? [])
      return listEntry?.[0]?.type === pluginKey
    },
    [pluginKey]
  )

  const handleClick = () => {
    toggleList(editor, { type: pluginKey })
    editor.tf.focus()
  }

  return (
    <ToolbarButton
      tooltip={tooltip}
      pressed={pressed}
      onClick={handleClick}
    >
      {nodeType === 'ul' ? (
        <List className="h-4 w-4" />
      ) : (
        <ListOrdered className="h-4 w-4" />
      )}
    </ToolbarButton>
  )
}
