
import * as React from 'react'
import { PlateContent, type PlateContentProps } from 'platejs/react'
import { cn } from '../../../utils/cn'

export interface EditorContainerProps extends React.HTMLAttributes<HTMLDivElement> {
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
export const EditorContainer = React.forwardRef<HTMLDivElement, EditorContainerProps>(
  ({ className, defaultHeight, minHeight = 150, maxHeight, resizable = true, disabled, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-auto bg-background',
          resizable && 'resize-y',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        style={{
          height: defaultHeight ? (typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight) : undefined,
          minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EditorContainer.displayName = 'EditorContainer'

export interface EditorWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
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
export const EditorWrapper = React.forwardRef<HTMLDivElement, EditorWrapperProps>(
  ({ className, disabled, error, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-x-hidden rounded-md border bg-background transition-[color,box-shadow]',
          error
            ? 'border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]'
            : 'border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
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
}

/**
 * The actual editable content area
 */
export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, readOnly, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none w-full p-4 outline-none',
          'prose-headings:font-semibold prose-headings:leading-tight',
          'prose-h1:text-2xl prose-h1:mb-4',
          'prose-h2:text-xl prose-h2:mb-3',
          'prose-h3:text-lg prose-h3:mb-2',
          'prose-p:my-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto prose-pre:max-w-full',
          'prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:my-1',
          'prose-a:text-primary prose-a:underline prose-a:underline-offset-4',
          '[&_*::selection]:bg-primary/20',
          // Prevent horizontal overflow from long content
          'break-words',
          '[&_table]:table-fixed [&_table]:w-full',
          '[&_td]:break-words [&_th]:break-words',
          disabled && 'pointer-events-none',
          className
        )}
        readOnly={readOnly || disabled}
        {...props}
      />
    )
  }
)
Editor.displayName = 'Editor'
