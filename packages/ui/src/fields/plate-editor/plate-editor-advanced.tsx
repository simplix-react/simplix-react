
import * as React from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FileCode,
  Subscript,
  Superscript,
  Highlighter,
  Palette,
} from 'lucide-react'
import { Plate, usePlateEditor } from 'platejs/react'
import { KEYS } from 'platejs'

import { useTranslation } from '@simplix-react/i18n/react'
import type { PlateEditorAdvancedProps } from './types'
import { EMPTY_EDITOR_VALUE } from './types'
import { EditorContainer, EditorWrapper, Editor } from './components/editor-container'
import {
  FixedToolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from './components/toolbar'
import { MarkToolbarButton } from './components/mark-toolbar-button'
import { TurnIntoToolbarButton } from './components/turn-into-toolbar-button'
import { LinkToolbarButton } from './components/link-toolbar-button'
import { ListToolbarButton } from './components/list-toolbar-button'
import { FontSizeToolbarButton } from './components/font-size-toolbar-button'
import { ColorToolbarButton } from './components/color-toolbar-button'
import { AlignToolbarButton } from './components/align-toolbar-button'
import { TableDropdownMenu } from './components/table-dropdown-menu'
import { TableFloatingToolbar } from './components/table-floating-toolbar'
import { BasicMarksKit } from './plugins/basic-marks-kit'
import { BasicBlocksKit } from './plugins/basic-blocks-kit'
import { ListKit } from './plugins/list-kit'
import { LinkKit } from './plugins/link-kit'
import { CodeBlockKit } from './plugins/code-block-kit'
import { FontStylesKit } from './plugins/font-styles-kit'
import { TableKit } from './plugins/table-kit'

/**
 * Level 3: Advanced Plate Editor
 *
 * Features (extends Standard):
 * - All Standard features (except image/mention)
 * - Font size control
 * - Font color and background color
 * - Text alignment (left, center, right, justify)
 * - Subscript and Superscript
 * - Highlight (background color for text)
 * - Tables with cell formatting
 */
export function PlateEditorAdvanced({
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
  className,
  defaultHeight = 300,
  minHeight = 150,
  maxHeight,
  resizable = true,
  showToolbar = true,
  autoFocus = false,
}: PlateEditorAdvancedProps) {
  const { t } = useTranslation("simplix/ui")

  const editor = usePlateEditor({
    plugins: [
      ...BasicMarksKit,
      ...BasicBlocksKit,
      ...ListKit,
      ...LinkKit,
      ...CodeBlockKit,
      ...FontStylesKit,
      ...TableKit,
    ],
    value: value || EMPTY_EDITOR_VALUE,
  })

  // Handle auto focus
  React.useEffect(() => {
    if (autoFocus && !readOnly && !disabled) {
      editor.tf.focus()
    }
  }, [editor, autoFocus, readOnly, disabled])

  // Sync value prop changes in readOnly mode
  React.useEffect(() => {
    if (readOnly && value) {
      editor.tf.setValue(value)
    }
  }, [value, editor, readOnly])

  const turnIntoOptions = [
    { label: t('plateEditor.toolbar.paragraph'), value: KEYS.p },
    { label: t('plateEditor.toolbar.heading1'), value: KEYS.h1 },
    { label: t('plateEditor.toolbar.heading2'), value: KEYS.h2 },
    { label: t('plateEditor.toolbar.heading3'), value: KEYS.h3 },
    { label: t('plateEditor.toolbar.blockquote'), value: KEYS.blockquote },
    { label: t('plateEditor.toolbar.codeBlock'), value: KEYS.codeBlock },
  ]

  return (
    <EditorWrapper className={className} disabled={disabled}>
      <Plate
        editor={editor}
        onChange={({ value: newValue }) => {
          onChange?.(newValue)
        }}
      >
        {showToolbar && !readOnly && !disabled && (
          <FixedToolbar className="flex-wrap">
            {/* Block type */}
            <ToolbarGroup>
              <TurnIntoToolbarButton options={turnIntoOptions} />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Font size */}
            <ToolbarGroup>
              <FontSizeToolbarButton
                decreaseTooltip={t('plateEditor.toolbar.fontSizeDecrease')}
                increaseTooltip={t('plateEditor.toolbar.fontSizeIncrease')}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Basic text formatting */}
            <ToolbarGroup>
              <MarkToolbarButton
                nodeType={KEYS.bold}
                tooltip={`${t('plateEditor.toolbar.bold')} (Cmd+B)`}
              >
                <Bold className="h-4 w-4" />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={KEYS.italic}
                tooltip={`${t('plateEditor.toolbar.italic')} (Cmd+I)`}
              >
                <Italic className="h-4 w-4" />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={KEYS.underline}
                tooltip={`${t('plateEditor.toolbar.underline')} (Cmd+U)`}
              >
                <Underline className="h-4 w-4" />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={KEYS.strikethrough}
                tooltip={`${t('plateEditor.toolbar.strikethrough')} (Cmd+Shift+X)`}
              >
                <Strikethrough className="h-4 w-4" />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={KEYS.code}
                tooltip={`${t('plateEditor.toolbar.code')} (Cmd+E)`}
              >
                <Code className="h-4 w-4" />
              </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Subscript, Superscript */}
            <ToolbarGroup>
              <MarkToolbarButton
                nodeType="subscript"
                tooltip={`${t('plateEditor.toolbar.subscript')} (Cmd+,)`}
              >
                <Subscript className="h-4 w-4" />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType="superscript"
                tooltip={`${t('plateEditor.toolbar.superscript')} (Cmd+.)`}
              >
                <Superscript className="h-4 w-4" />
              </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Font color, Background color */}
            <ToolbarGroup>
              <ColorToolbarButton
                nodeType={KEYS.color}
                tooltip={t('plateEditor.toolbar.fontColor')}
              >
                <Palette className="h-4 w-4" />
              </ColorToolbarButton>
              <ColorToolbarButton
                nodeType={KEYS.backgroundColor}
                tooltip={t('plateEditor.toolbar.backgroundColor')}
                isBackground
              >
                <Highlighter className="h-4 w-4" />
              </ColorToolbarButton>
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Text alignment */}
            <ToolbarGroup>
              <AlignToolbarButton tooltip={t('plateEditor.toolbar.align')} />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Lists */}
            <ToolbarGroup>
              <ListToolbarButton
                nodeType="ul"
                tooltip={t('plateEditor.toolbar.bulletList')}
              />
              <ListToolbarButton
                nodeType="ol"
                tooltip={t('plateEditor.toolbar.numberedList')}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* Link, Code block, Table */}
            <ToolbarGroup>
              <LinkToolbarButton tooltip={t('plateEditor.toolbar.link')} />
              <MarkToolbarButton
                nodeType={KEYS.codeBlock}
                tooltip={`${t('plateEditor.toolbar.codeBlock')} (Cmd+Alt+8)`}
                onClick={() => editor.tf.toggleBlock(KEYS.codeBlock)}
              >
                <FileCode className="h-4 w-4" />
              </MarkToolbarButton>
              <TableDropdownMenu />
            </ToolbarGroup>
          </FixedToolbar>
        )}

        <EditorContainer
          defaultHeight={defaultHeight}
          minHeight={minHeight}
          maxHeight={maxHeight}
          resizable={resizable}
          disabled={disabled}
        >
          <Editor
            readOnly={readOnly}
            disabled={disabled}
            placeholder={placeholder || t('plateEditor.placeholder.default')}
          />
        </EditorContainer>

        {/* Table floating toolbar - appears when cursor is inside a table */}
        {!readOnly && !disabled && (
          <div className="relative">
            <div className="absolute left-2 top-2 z-50">
              <TableFloatingToolbar />
            </div>
          </div>
        )}
      </Plate>
    </EditorWrapper>
  )
}

export default PlateEditorAdvanced
