
import * as React from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react'
import { Plate, usePlateEditor } from 'platejs/react'
import { KEYS } from 'platejs'

import { useTranslation } from '@simplix-react/i18n/react'
import type { PlateEditorBasicProps } from './types'
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
import { BasicMarksKit } from './plugins/basic-marks-kit'
import { BasicBlocksKit } from './plugins/basic-blocks-kit'
import { ListKit } from './plugins/list-kit'
import { LinkKit } from './plugins/link-kit'

/**
 * Level 1: Basic Plate Editor
 *
 * Features:
 * - Text formatting: Bold, Italic, Underline, Strikethrough
 * - Block types: Heading 1-3, Paragraph, Blockquote
 * - Lists: Bullet list, Numbered list
 * - Links
 */
export function PlateEditorBasic({
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
  className,
  defaultHeight = 200,
  minHeight = 150,
  maxHeight,
  resizable = true,
  showToolbar = true,
  autoFocus = false,
}: PlateEditorBasicProps) {
  const { t } = useTranslation("simplix/ui")

  const editor = usePlateEditor({
    plugins: [
      ...BasicMarksKit,
      ...BasicBlocksKit,
      ...ListKit,
      ...LinkKit,
    ],
    value: value || EMPTY_EDITOR_VALUE,
  })

  // Handle auto focus
  React.useEffect(() => {
    if (autoFocus && !readOnly && !disabled) {
      editor.tf.focus()
    }
  }, [editor, autoFocus, readOnly, disabled])

  const turnIntoOptions = [
    { label: t('plateEditor.toolbar.paragraph'), value: KEYS.p },
    { label: t('plateEditor.toolbar.heading1'), value: KEYS.h1 },
    { label: t('plateEditor.toolbar.heading2'), value: KEYS.h2 },
    { label: t('plateEditor.toolbar.heading3'), value: KEYS.h3 },
    { label: t('plateEditor.toolbar.blockquote'), value: KEYS.blockquote },
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
          <FixedToolbar>
            <ToolbarGroup>
              <TurnIntoToolbarButton options={turnIntoOptions} />
            </ToolbarGroup>

            <ToolbarSeparator />

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
            </ToolbarGroup>

            <ToolbarSeparator />

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

            <ToolbarGroup>
              <LinkToolbarButton tooltip={t('plateEditor.toolbar.link')} />
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
      </Plate>
    </EditorWrapper>
  )
}

export default PlateEditorBasic
