import { useRef } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { PillDot } from '../../shared/pill-dot'
import { useDropzoneDrag } from '../../shared/use-dropzone-drag'

export interface StageDropzoneProps {
  onDrop: (file: File) => void
  maxFiles?: number
  currentCount?: number
  allowedExtensions?: string[]
  /** Pre-formatted max-size label (e.g. "파일당 최대 10MB"). Always shown when provided. */
  maxSizeLabel?: string
  accept?: string
}

export function StageDropzone({
  onDrop,
  maxFiles,
  currentCount,
  allowedExtensions,
  maxSizeLabel,
  accept = 'image/*',
}: StageDropzoneProps) {
  const { t } = useTranslation('simplix/ui')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (f) onDrop(f)
  }

  const { isDragOver, dragProps, resetInput } = useDropzoneDrag({
    onFiles: handleFiles,
  })

  const extensionsLabel =
    allowedExtensions && allowedExtensions.length > 0
      ? allowedExtensions.map((e) => `.${e}`).join(', ')
      : null

  return (
    <div
      className={cn(
        'absolute inset-0 grid place-items-center cursor-pointer',
        'bg-muted transition-[background]',
        isDragOver ? 'bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]' : '',
        'focus-visible:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]',
      )}
      role="button"
      tabIndex={0}
      aria-label={t('file.stage.dropTitle')}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      {...dragProps}
    >
      {/* Dashed border affordance — same style as FileDropzone (border-2 border-dashed
          border-input rounded-md), inset from the stage edge. */}
      <span
        className={cn(
          'pointer-events-none absolute inset-3 rounded-md border-2 border-dashed transition-colors',
          isDragOver ? 'border-primary' : 'border-input',
        )}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-2 @md:gap-[14px] text-center px-4 py-4 @md:px-6 @md:py-6 max-w-[540px] pointer-events-none">
        {/* Upload icon */}
        <div className="w-10 h-10 @md:w-[54px] @md:h-[54px] rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary grid place-items-center shrink-0 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 @md:w-[26px] @md:h-[26px]"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Title — hidden when the dropzone stacks to the cramped/narrow stage (< @md), shown from @md */}
        <div className="hidden text-[15.5px] font-bold text-foreground tracking-[-0.01em] leading-[1.35] @md:block">
          {t('file.stage.dropTitle')}
        </div>

        {/* Constraints row */}
        {(maxFiles != null || maxSizeLabel || extensionsLabel) ? (
          <div className="flex items-center gap-[10px] text-[11.5px] text-muted-foreground flex-wrap justify-center">
            {maxFiles != null ? (
              <span className="inline-flex items-center gap-[5px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[13px] h-[13px] text-muted-foreground"
                  aria-hidden="true"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
                {t('file.dropzone.maxFiles', { max: maxFiles })}
                {currentCount != null ? (
                  <span className="ml-[2px] tabular-nums font-bold text-foreground tracking-[-0.005em]">
                    {t('file.dropzone.count', { current: currentCount, max: maxFiles })}
                  </span>
                ) : null}
              </span>
            ) : null}

            {maxFiles != null && maxSizeLabel ? <PillDot /> : null}

            {maxSizeLabel ? (
              <span className="inline-flex items-center gap-[5px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[13px] h-[13px] text-muted-foreground"
                  aria-hidden="true"
                >
                  <line x1="22" y1="12" x2="2" y2="12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
                {maxSizeLabel}
              </span>
            ) : null}

            {(maxFiles != null || maxSizeLabel) && extensionsLabel ? (
              <PillDot />
            ) : null}

            {extensionsLabel ? (
              <span
                className="group relative inline-flex items-center gap-[5px] cursor-help pointer-events-auto rounded-sm px-[2px] mx-[-2px] transition-colors hover:text-secondary-foreground hover:bg-muted focus-visible:outline-none focus-visible:text-secondary-foreground focus-visible:bg-muted"
                tabIndex={0}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[13px] h-[13px]"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
                {t('file.stage.extensions')}
                {/* Tooltip */}
                <span
                  className={cn(
                    'absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
                    'bg-foreground text-white text-[11.5px] leading-[1.5] py-[7px] px-[11px] rounded',
                    'w-max max-w-[260px] text-left font-medium tracking-[.01em]',
                    'pointer-events-none z-50 opacity-0 invisible transition-[opacity,transform]',
                    'group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible',
                  )}
                  role="tooltip"
                >
                  <strong className="block font-semibold text-white mb-[3px] text-[10.5px] opacity-75 tracking-[.04em] uppercase">
                    {t('file.stage.extensionsTitle')}
                  </strong>
                  {extensionsLabel}
                  <span
                    className="absolute bottom-[-3px] left-1/2 ml-[-5px] w-[9px] h-[9px] bg-foreground rotate-45 rounded-sm"
                    aria-hidden="true"
                  />
                </span>
              </span>
            ) : null}
          </div>
        ) : null}

        {/* CTA button */}
        <button
          type="button"
          className="mt-[2px] h-[34px] px-[18px] rounded bg-primary text-primary-foreground border-none text-[12.5px] font-semibold cursor-pointer transition-[background] pointer-events-auto hover:bg-[var(--primary-hover,var(--primary))] font-[inherit]"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          {t('file.stage.dropCta')}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          resetInput(e.target)
        }}
      />
    </div>
  )
}
