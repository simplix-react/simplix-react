/**
 * Plate Editor Types
 * Common type definitions for plate editor components
 */

import type { Value } from 'platejs'

// Re-export Value type for consumers
export type { Value }

/**
 * Mention item for @ mentions (used in Standard editor)
 */
export interface MentionItem {
  id: string
  label: string
  avatarUrl?: string
  description?: string
}

/**
 * Base props for all plate editor levels
 */
export interface PlateEditorBaseProps {
  /** Editor content value */
  value?: Value
  /** Callback when content changes */
  onChange?: (value: Value) => void
  /** Placeholder text */
  placeholder?: string
  /** Read-only mode */
  readOnly?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Default (initial) height of the editor */
  defaultHeight?: number | string
  /** Minimum height of the editor */
  minHeight?: number | string
  /** Maximum height of the editor */
  maxHeight?: number | string
  /** Enable vertical resize (default: true) */
  resizable?: boolean
  /** Show toolbar (default: true) */
  showToolbar?: boolean
  /** Auto-focus on mount */
  autoFocus?: boolean
}

/**
 * Level 1: Basic Editor Props
 * Includes: Bold, Italic, Underline, Strikethrough, Heading(H1-H3), List, Link
 */
export interface PlateEditorBasicProps extends PlateEditorBaseProps {}

/**
 * Level 2: Standard Editor Props
 * Includes: Basic + Image, Blockquote, Code/CodeBlock
 */
export interface PlateEditorStandardProps extends PlateEditorBaseProps {
  /** Custom image upload handler */
  onImageUpload?: (file: File) => Promise<string>
  /** Maximum image file size in bytes (default: 5MB) */
  maxImageSize?: number
  /** Accepted image formats (default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) */
  acceptedImageFormats?: string[]
}

/**
 * Level 3: Advanced Editor Props
 * Includes: Basic + Font styles, Text align, Tables (no image/mention)
 * Features: Font size, Font color, Background color, Text alignment, Subscript/Superscript, Tables
 */
export interface PlateEditorAdvancedProps extends PlateEditorBaseProps {}

/**
 * Default image upload config
 */
export const DEFAULT_IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

/**
 * Default editor value (empty paragraph)
 */
export const EMPTY_EDITOR_VALUE: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
]
