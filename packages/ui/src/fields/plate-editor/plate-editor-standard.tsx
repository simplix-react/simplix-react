
import * as React from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Image,
  Code,
  FileCode,
} from 'lucide-react'
import { Plate, usePlateEditor } from 'platejs/react'
import { KEYS } from 'platejs'

import { useTranslation } from '@simplix-react/i18n/react'
import type { PlateEditorStandardProps } from './types'
import { EMPTY_EDITOR_VALUE, DEFAULT_IMAGE_CONFIG } from './types'
import { EditorContainer, EditorWrapper, Editor } from './components/editor-container'
import {
  FixedToolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarButton,
} from './components/toolbar'
import { MarkToolbarButton } from './components/mark-toolbar-button'
import { TurnIntoToolbarButton } from './components/turn-into-toolbar-button'
import { LinkToolbarButton } from './components/link-toolbar-button'
import { ListToolbarButton } from './components/list-toolbar-button'
import { BasicMarksKit } from './plugins/basic-marks-kit'
import { BasicBlocksKit } from './plugins/basic-blocks-kit'
import { ListKit } from './plugins/list-kit'
import { LinkKit } from './plugins/link-kit'
import { CodeBlockKit } from './plugins/code-block-kit'
import { createMediaKit } from './plugins/media-kit'

/**
 * Level 2: Standard Plate Editor
 *
 * Features (extends Basic):
 * - All Basic features
 * - Image upload/embed
 * - Code block with syntax highlighting
 * - Inline code
 */
export function PlateEditorStandard({
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
  className,
  defaultHeight = 250,
  minHeight = 150,
  maxHeight,
  resizable = true,
  showToolbar = true,
  autoFocus = false,
  onImageUpload,
  maxImageSize = DEFAULT_IMAGE_CONFIG.maxSize,
  acceptedImageFormats = DEFAULT_IMAGE_CONFIG.acceptedFormats,
}: PlateEditorStandardProps) {
  const { t } = useTranslation("simplix/ui")

  // Create media kit with upload handler
  const mediaKit = React.useMemo(
    () =>
      createMediaKit({
        uploadHandler: onImageUpload,
        maxImageSize,
        acceptedFormats: acceptedImageFormats,
      }),
    [onImageUpload, maxImageSize, acceptedImageFormats]
  )

  const editor = usePlateEditor({
    plugins: [
      ...BasicMarksKit,
      ...BasicBlocksKit,
      ...ListKit,
      ...LinkKit,
      ...CodeBlockKit,
      ...mediaKit,
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
    { label: t('plateEditor.toolbar.codeBlock'), value: KEYS.codeBlock },
  ]

  // Handle image upload via file input
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImageUpload) return

    try {
      const url = await onImageUpload(file)
      editor.tf.insertNodes({ type: KEYS.img, url, children: [{ text: '' }] })
    } catch (error) {
      console.error('Image upload failed:', error)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Code block toggle
  const handleCodeBlockToggle = () => {
    editor.tf.toggleBlock(KEYS.codeBlock)
  }

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
              <MarkToolbarButton
                nodeType={KEYS.code}
                tooltip={`${t('plateEditor.toolbar.code')} (Cmd+E)`}
              >
                <Code className="h-4 w-4" />
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
              {onImageUpload && (
                <>
                  <ToolbarButton
                    tooltip={t('plateEditor.toolbar.image')}
                    onClick={handleImageButtonClick}
                  >
                    <Image className="h-4 w-4" />
                  </ToolbarButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedImageFormats.join(',')}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </>
              )}
              <ToolbarButton
                tooltip={`${t('plateEditor.toolbar.codeBlock')} (Cmd+Alt+8)`}
                onClick={handleCodeBlockToggle}
              >
                <FileCode className="h-4 w-4" />
              </ToolbarButton>
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

export default PlateEditorStandard
