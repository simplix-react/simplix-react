
import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { KEYS } from 'platejs'
import { cn } from '../../../utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../base/navigation/dropdown-menu'
import { ToolbarButton } from './toolbar'

export interface TurnIntoOption {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface TurnIntoToolbarButtonProps {
  /** Available block types to turn into */
  options?: TurnIntoOption[]
  /** Additional CSS class */
  className?: string
}

const DEFAULT_OPTIONS: TurnIntoOption[] = [
  { label: 'Paragraph', value: KEYS.p },
  { label: 'Heading 1', value: KEYS.h1 },
  { label: 'Heading 2', value: KEYS.h2 },
  { label: 'Heading 3', value: KEYS.h3 },
  { label: 'Blockquote', value: KEYS.blockquote },
]

/**
 * Dropdown button for turning current block into different types
 */
export const TurnIntoToolbarButton = React.forwardRef<
  HTMLButtonElement,
  TurnIntoToolbarButtonProps
>(({ options = DEFAULT_OPTIONS, className }, ref) => {
  const editor = useEditorRef()
  const currentType = useEditorSelector((editor) => {
    // Get the block at the current selection using editor.api
    const block = editor.api.block()
    return block?.[0]?.type as string | undefined
  }, [])

  const currentOption = options.find((opt) => opt.value === currentType) || options[0]

  const handleSelect = (value: string) => {
    // Use editor.tf.setNodes to change block type
    editor.tf.setNodes({ type: value })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          ref={ref}
          className={cn('min-w-[100px] justify-between gap-1', className)}
        >
          <span className="truncate">{currentOption?.label || 'Paragraph'}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[150px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(currentType === option.value && 'bg-accent')}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
TurnIntoToolbarButton.displayName = 'TurnIntoToolbarButton'
