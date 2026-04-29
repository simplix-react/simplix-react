
import * as React from 'react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from 'lucide-react'
import { useEditorRef, useSelectionFragmentProp } from 'platejs/react'
import type { TElement } from 'platejs'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../base/navigation/dropdown-menu'
import { useTranslation } from '@simplix-react/i18n/react'
import { ToolbarButton } from './toolbar'

type AlignValue = 'left' | 'center' | 'right' | 'justify'

const alignIcons: Record<AlignValue, React.ReactNode> = {
  left: <AlignLeft className="h-3.5 w-3.5" />,
  center: <AlignCenter className="h-3.5 w-3.5" />,
  right: <AlignRight className="h-3.5 w-3.5" />,
  justify: <AlignJustify className="h-3.5 w-3.5" />,
}

const alignI18nKeys: Record<AlignValue, string> = {
  left: 'plateEditor.toolbar.alignLeft',
  center: 'plateEditor.toolbar.alignCenter',
  right: 'plateEditor.toolbar.alignRight',
  justify: 'plateEditor.toolbar.alignJustify',
}

const alignValues: AlignValue[] = ['left', 'center', 'right', 'justify']

export interface AlignToolbarButtonProps {
  tooltip?: string
}

/**
 * Toolbar button for text alignment
 */
export function AlignToolbarButton({ tooltip }: AlignToolbarButtonProps) {
  const editor = useEditorRef()
  const { t } = useTranslation('simplix/ui')
  const [open, setOpen] = React.useState(false)

  const currentAlign = useSelectionFragmentProp({
    defaultValue: 'left',
    getProp: (node) => (node as TElement).align as AlignValue | undefined,
  }) as AlignValue
  const currentValue: AlignValue = alignValues.includes(currentAlign) ? currentAlign : 'left'

  const handleSelect = React.useCallback(
    (align: AlignValue) => {
      editor.tf.setNodes({ align } as Partial<TElement>)
      editor.tf.focus()
      setOpen(false)
    },
    [editor]
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip} className="gap-0.5 px-1">
          {alignIcons[currentValue]}
          <ChevronDown className="h-3 w-3" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[100px]"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          editor.tf.focus()
        }}
      >
        {alignValues.map((value) => (
          <DropdownMenuItem
            key={value}
            className="gap-2 text-xs"
            onSelect={() => handleSelect(value)}
          >
            {alignIcons[value]}
            <span>{t(alignI18nKeys[value])}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
