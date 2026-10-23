
import { forwardRef, type HTMLAttributes } from 'react'
import { PlateContent, type PlateContentProps } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { plateEditorContainerStyle, plateEditorStyle, plateEditorWrapperStyle } from './editor-container.style'

export interface EditorContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Default height of the editor (initial height) */
  defaultHeight?: number | string
  /** Minimum height of the editor */
  minHeight?: number | string
  /** Maximum height of the editor */
  maxHeight?: number | string
  /** Enable vertical resize */
  resizable?: boolean
  /** Disabled state */
  disabled?: boolean
}

/**
 * Container for the plate editor content area with styling
 */
export const EditorContainer = forwardRef<HTMLDivElement, EditorContainerProps>(
  ({ className, defaultHeight, minHeight = 150, maxHeight, resizable = true, disabled, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-auto',
          resizable && 'resize-y',
          disabled && 'cursor-not-allowed',
          className
        )}
        style={{
          height: defaultHeight ? (typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight) : undefined,
          minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
        {...props}
        {...slotAttributes(plateEditorContainerStyle, { disabled })}
      >
        {children}
      </div>
    )
  }
)
EditorContainer.displayName = 'EditorContainer'

export interface EditorWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** Disabled state */
  disabled?: boolean
  /** Error state - shows destructive border */
  error?: boolean
}

/**
 * Outer wrapper that provides unified border for toolbar and editor
 * Note: overflow-x-hidden prevents horizontal expansion from long code blocks
 * Floating toolbars use position:fixed so they're not affected
 */
export const EditorWrapper = forwardRef<HTMLDivElement, EditorWrapperProps>(
  ({ className, disabled, error, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-x-hidden',
          disabled && 'cursor-not-allowed',
          className
        )}
        {...props}
        {...slotAttributes(plateEditorWrapperStyle, { invalid: error, disabled })}
      >
        {children}
      </div>
    )
  }
)
EditorWrapper.displayName = 'EditorWrapper'

export interface EditorProps extends PlateContentProps {
  /** Disabled state */
  disabled?: boolean
  /** Padding around the content; `none` for content shown inside a panel that pads it. */
  padding?: 'default' | 'none'
}

/**
 * The actual editable content area
 */
export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, readOnly, padding, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          'max-w-none w-full',
          // Prevent horizontal overflow from long content
          'break-words',
          '[&_table]:table-fixed [&_table]:w-full',
          '[&_td]:break-words [&_th]:break-words',
          disabled && 'pointer-events-none',
          className
        )}
        readOnly={readOnly || disabled}
        {...props}
        {...slotAttributes(plateEditorStyle, { padding })}
      />
    )
  }
)
Editor.displayName = 'Editor'
