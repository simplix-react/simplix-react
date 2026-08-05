import { useRef } from 'react'
import { Upload, Layers, HardDrive, FileCheck } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { useFlatUIComponents } from '../../../provider/ui-provider'
import { PillDot } from '../../shared/pill-dot'
import { useDropzoneDrag } from '../../shared/use-dropzone-drag'

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

  const resolvedTitle = title ?? t('file.dropzone.title')
  const resolvedCta = cta ?? t('file.dropzone.cta')

  function handleFiles(files: FileList | null) {
    if (!files || disabled) return
    const arr = Array.from(files)
    if (arr.length > 0) onDrop(arr)
  }

  const { isDragOver, dragProps, resetInput } = useDropzoneDrag({
    onFiles: handleFiles,
    disabled,
  })

  return (
    // A drop target and a mouse shortcut, not a control: the CTA inside it is the control, and a
    // control nested in a control leaves the keyboard and assistive technology to guess which of
    // the two a press belongs to. The zone therefore takes no role, no tab stop, and no key
    // handler — reaching the picker from the keyboard goes through the CTA.
    <div
      role="group"
      aria-label={resolvedTitle}
      className={cn(
        // Compact single row at any width: small icon + constraint meta + inline CTA.
        'flex items-center gap-2.5 rounded-md border border-dashed border-input',
        'bg-muted/60 px-3 py-2 transition-colors',
        isDragOver && !disabled && 'border-primary bg-primary/10',
        disabled && 'pointer-events-none opacity-50',
      )}
      {...dragProps}
      onClick={() => inputRef.current?.click()}
    >
      {/* Icon */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
        <Upload size={15} aria-hidden="true" />
      </div>

      {/* Constraint pills: lucide icon + label. Each pill is an atomic inline-flex unit and
          carries its separator dot as a TRAILING child, so a wrapped second line never starts
          with a dot. gap-x for inline spacing, smaller gap-y for the wrapped line. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
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

      {/* CTA button — inline, compact */}
      <Button
        type="button"
        variant="default"
        size="sm"
        className="h-7 shrink-0"
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
          resetInput(e.target)
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
