import { useRef } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { slotAttributes } from '../../../design/slot-style'
import {
  stageDropzoneBodyStyle,
  stageDropzoneConstraintsStyle,
  stageDropzoneCountStyle,
  stageDropzoneCtaStyle,
  stageDropzoneExtensionsStyle,
  stageDropzoneIconStyle,
  stageDropzoneOutlineStyle,
  stageDropzonePillIconStyle,
  stageDropzonePillStyle,
  stageDropzoneStyle,
  stageDropzoneTitleStyle,
  stageDropzoneTooltipArrowStyle,
  stageDropzoneTooltipStyle,
  stageDropzoneTooltipTitleStyle,
} from './stage-dropzone.style'
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

  // A drop target and a mouse shortcut, not a control: the CTA inside it is the control, and a
  // control nested in a control leaves the keyboard and assistive technology to guess which of the
  // two a press belongs to. The zone therefore takes no button role, no tab stop, and no key
  // handler - reaching the picker from the keyboard goes through the CTA.
  return (
    <div
      className="absolute inset-0 grid place-items-center cursor-pointer"
      role="group"
      aria-label={t('file.stage.dropTitle')}
      onClick={() => inputRef.current?.click()}
      {...dragProps}
      {...slotAttributes(stageDropzoneStyle, { over: isDragOver })}
    >
      {/* Dashed border affordance - same style as FileDropzone (border-2 border-dashed
          border-input rounded-md), inset from the stage edge. */}
      <span
        className="pointer-events-none absolute inset-3"
        aria-hidden="true"
        {...slotAttributes(stageDropzoneOutlineStyle, { over: isDragOver })}
      />

      <div className="flex flex-col items-center max-w-[540px] pointer-events-none" {...slotAttributes(stageDropzoneBodyStyle, {})}>
        {/* Upload icon */}
        <div className="w-10 h-10 @md:w-[54px] @md:h-[54px] grid place-items-center shrink-0" {...slotAttributes(stageDropzoneIconStyle, {})}>
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

        {/* Title - hidden when the dropzone stacks to the cramped/narrow stage (< @md), shown from @md */}
        <div className="hidden @md:block" {...slotAttributes(stageDropzoneTitleStyle, {})}>
          {t('file.stage.dropTitle')}
        </div>

        {/* Constraints row */}
        {(maxFiles != null || maxSizeLabel || extensionsLabel) ? (
          <div className="flex items-center flex-wrap justify-center" {...slotAttributes(stageDropzoneConstraintsStyle, {})}>
            {maxFiles != null ? (
              <span className="inline-flex items-center" {...slotAttributes(stageDropzonePillStyle, {})}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[13px] h-[13px]"
                  aria-hidden="true"
                  {...slotAttributes(stageDropzonePillIconStyle, {})}
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
                {t('file.dropzone.maxFiles', { max: maxFiles })}
                {currentCount != null ? (
                  <span {...slotAttributes(stageDropzoneCountStyle, {})}>
                    {t('file.dropzone.count', { current: currentCount, max: maxFiles })}
                  </span>
                ) : null}
              </span>
            ) : null}

            {maxFiles != null && maxSizeLabel ? <PillDot /> : null}

            {maxSizeLabel ? (
              <span className="inline-flex items-center" {...slotAttributes(stageDropzonePillStyle, {})}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[13px] h-[13px]"
                  aria-hidden="true"
                  {...slotAttributes(stageDropzonePillIconStyle, {})}
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
                className="group relative inline-flex items-center cursor-help pointer-events-auto"
                tabIndex={0}
                {...slotAttributes(stageDropzoneExtensionsStyle, {})}
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
                  className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[260px] pointer-events-none z-50 invisible group-hover:visible group-focus-within:visible"
                  role="tooltip"
                  {...slotAttributes(stageDropzoneTooltipStyle, {})}
                >
                  <strong className="block" {...slotAttributes(stageDropzoneTooltipTitleStyle, {})}>
                    {t('file.stage.extensionsTitle')}
                  </strong>
                  {extensionsLabel}
                  <span
                    className="absolute bottom-[-3px] left-1/2 w-[9px] h-[9px] rotate-45"
                    aria-hidden="true"
                    {...slotAttributes(stageDropzoneTooltipArrowStyle, {})}
                  />
                </span>
              </span>
            ) : null}
          </div>
        ) : null}

        {/* CTA button */}
        <button
          type="button"
          className="h-[34px] cursor-pointer pointer-events-auto"
          {...slotAttributes(stageDropzoneCtaStyle, {})}
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
