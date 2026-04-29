
import * as React from 'react'
import { useEditorRef, useEditorSelector } from 'platejs/react'

import { cn } from '../../../utils/cn'
import { useTranslation } from '@simplix-react/i18n/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../base/overlay/popover'
import { Input } from '../../../base/inputs/input'
import { ToolbarButton } from './toolbar'
import { FONT_COLORS, HIGHLIGHT_COLORS } from '../plugins/font-styles-kit'

export interface ColorToolbarButtonProps {
  /** Mark key for the color (e.g., 'color', 'backgroundColor') */
  nodeType: string
  /** Tooltip text */
  tooltip?: string
  /** Color palette to use */
  colors?: string[]
  /** Icon to display */
  children: React.ReactNode
  /** Whether this is a background color picker */
  isBackground?: boolean
}

/**
 * Toolbar button for selecting colors (font color or background color)
 */
export function ColorToolbarButton({
  nodeType,
  tooltip,
  colors,
  children,
  isBackground = false,
}: ColorToolbarButtonProps) {
  const editor = useEditorRef()
  const { t } = useTranslation("simplix/ui")
  const [open, setOpen] = React.useState(false)
  const [customColor, setCustomColor] = React.useState('')

  const currentColor = useEditorSelector(
    (editor) => editor.api.mark(nodeType) as string | undefined,
    [nodeType]
  )

  const colorPalette = colors || (isBackground ? HIGHLIGHT_COLORS : FONT_COLORS)

  const handleSelect = React.useCallback(
    (color: string) => {
      if (editor.selection) {
        if (color === 'transparent' || color === '') {
          editor.tf.removeMarks(nodeType)
        } else {
          editor.tf.addMarks({ [nodeType]: color })
        }
        editor.tf.focus()
      }
      setOpen(false)
    },
    [editor, nodeType]
  )

  const handleClear = React.useCallback(() => {
    if (editor.selection) {
      editor.tf.removeMarks(nodeType)
      editor.tf.focus()
    }
    setOpen(false)
  }, [editor, nodeType])

  const handleCustomColorSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
        handleSelect(customColor)
        setCustomColor('')
      }
    },
    [customColor, handleSelect]
  )

  const handleColorInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      if (editor.selection) {
        editor.tf.addMarks({ [nodeType]: color })
      }
    },
    [editor, nodeType]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton tooltip={tooltip} className="relative">
          {children}
          {/* Color indicator bar */}
          <span
            className="absolute bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full"
            style={{
              backgroundColor: currentColor || (isBackground ? 'transparent' : '#000000'),
              border: currentColor === 'transparent' || !currentColor ? '1px dashed currentColor' : 'none',
            }}
          />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Color palette grid */}
        <div className="grid grid-cols-8 gap-1">
          {colorPalette.map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              className={cn(
                'h-5 w-5 rounded border border-border transition-transform hover:scale-110',
                currentColor === color && 'ring-2 ring-primary ring-offset-1',
                color === 'transparent' && 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]'
              )}
              style={{
                backgroundColor: color === 'transparent' ? undefined : color,
              }}
              onClick={() => handleSelect(color)}
              title={color}
            />
          ))}
        </div>

        {/* Custom color input */}
        <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
          <input
            type="color"
            value={currentColor || '#000000'}
            onChange={handleColorInputChange}
            className="h-6 w-6 cursor-pointer rounded border-0 p-0"
            title={t('plateEditor.colorPicker.custom')}
          />
          <form onSubmit={handleCustomColorSubmit} className="flex-1">
            <Input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#000000"
              className="h-6 px-1 text-[10px]"
              maxLength={7}
            />
          </form>
        </div>

        {/* Clear button */}
        {currentColor && currentColor !== 'transparent' && (
          <button
            type="button"
            className="mt-2 w-full rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent"
            onClick={handleClear}
          >
            {t('plateEditor.colorPicker.clear')}
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
