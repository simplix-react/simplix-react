import { useRef, useState } from 'react'
import { Upload, Layers, HardDrive, FileCheck } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { useFlatUIComponents } from '../../../provider/ui-provider'

export interface FileDropzoneProps {
  multiple?: boolean
  accept?: string
  disabled?: boolean
  title?: string
  cta?: string
  currentCount: number
  maxFiles?: number
  maxSizeLabel?: string
  allowedExtensions?: string[]
  onDrop: (files: File[]) => void
}

interface ExtensionsPillProps {
  allowedExtensions?: string[]
}

/** Small dot separator between constraint pills (mirrors original .fa-cdot). */
function PillDot() {
  return (
    <span
      className="inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-border"
      aria-hidden="true"
    />
  )
}

function ExtensionsPill({ allowedExtensions }: ExtensionsPillProps) {
  const { t } = useTranslation('simplix/ui')
  const { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } = useFlatUIComponents()

  const tooltipBody =
    allowedExtensions && allowedExtensions.length > 0
      ? allowedExtensions.map((ext) => `.${ext}`).join(', ')
      : t('file.dropzone.extensionsAll')

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <FileCheck size={12} aria-hidden="true" />
            {t('file.dropzone.extensions')}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-75">
            {t('file.dropzone.extensionsTitle')}
          </span>
          {tooltipBody}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Horizontal dashed-border dropzone atom.
 * Supports click-to-select and drag-and-drop file input.
 * CTA button uses useFlatUIComponents().Button.
 *
 * Prop contract (brief §C):
 *   currentCount  — total item count (all statuses) from file-field
 *   maxFiles      — config.maxAttachments
 *   maxSizeLabel  — pre-formatted size string
 *   allowedExtensions — raw extension array (e.g. ["pdf","docx"]), or undefined/empty for all
 *   title / cta   — override i18n defaults
 */
export function FileDropzone({
  multiple,
  accept,
  disabled,
  title,
  cta,
  currentCount,
  maxFiles,
  maxSizeLabel,
  allowedExtensions,
  onDrop,
}: FileDropzoneProps) {
  const { t } = useTranslation('simplix/ui')
  const { Button } = useFlatUIComponents()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const resolvedTitle = title ?? t('file.dropzone.title')
  const resolvedCta = cta ?? t('file.dropzone.cta')

  function handleFiles(files: FileList | null) {
    if (!files || disabled) return
    const arr = Array.from(files)
    if (arr.length > 0) onDrop(arr)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        // base (mobile): stacked column; @md (448px+): horizontal row (matches Grid breakpoints)
        'flex flex-col gap-3 rounded-md border-2 border-dashed border-input',
        '@md:flex-row @md:items-center @md:gap-3.5',
        'bg-muted px-3.5 py-3 transition-colors @md:px-[18px] @md:py-[14px]',
        isDragOver && !disabled && 'border-primary bg-primary/10',
        disabled && 'pointer-events-none opacity-50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      onClick={() => inputRef.current?.click()}
    >
      {/* Icon + text: stays a row; sits above the full-width CTA on narrow containers */}
      <div className="flex min-w-0 flex-1 items-center gap-3 @md:gap-3.5">
        {/* Icon box */}
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Upload size={18} aria-hidden="true" />
        </div>

        {/* Text area */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold">{resolvedTitle}</span>
          {/* Constraint pills: lucide icon + label. Each pill is an atomic inline-flex unit and
              carries its separator dot as a TRAILING child, so a wrapped second line never starts
              with a dot (prevents the extensions pill from being indented on wrap).
              gap-x for inline spacing, smaller gap-y for the wrapped line. */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            {maxFiles != null && (
              <span className="inline-flex items-center gap-1">
                <Layers size={12} aria-hidden="true" />
                {t('file.dropzone.maxFiles', { max: maxFiles })}
                <span className="ml-0.5 font-bold tabular-nums text-foreground">
                  {t('file.dropzone.count', { current: currentCount, max: maxFiles })}
                </span>
                <PillDot />
              </span>
            )}
            {maxSizeLabel && (
              <span className="inline-flex items-center gap-1">
                <HardDrive size={12} aria-hidden="true" />
                {maxSizeLabel}
                <PillDot />
              </span>
            )}
            <ExtensionsPill allowedExtensions={allowedExtensions} />
          </div>
        </div>
      </div>

      {/* CTA button: full-width below on narrow containers, inline from @md */}
      <Button
        type="button"
        variant="default"
        size="sm"
        className="h-9 w-full shrink-0 @md:h-8 @md:w-auto"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
      >
        {resolvedCta}
      </Button>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files)
          // Reset so selecting the same file again still fires onChange (re-upload).
          e.target.value = ''
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
