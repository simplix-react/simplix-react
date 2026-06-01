import type { ReactNode } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { useFlatUIComponents } from '../../../provider/ui-provider'

export interface ImageViewerModalProps {
  open: boolean
  onClose: () => void
  onDownload?: () => void
  fileName?: string
  fileSize?: string
  dimension?: string
  /** Preview content slot. raw <img> is permitted (AG-6). */
  preview?: ReactNode
}

/**
 * Full-size image preview modal.
 *
 * raw <img> is permitted for the preview slot (AG-6 / plan §6.5).
 * ESC + overlay close handled by Dialog internals.
 */
export function ImageViewerModal({
  open,
  onClose,
  onDownload,
  fileName,
  fileSize,
  dimension,
  preview,
}: ImageViewerModalProps) {
  const { t } = useTranslation('simplix/ui')
  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Badge,
  } = useFlatUIComponents()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Custom close in-header (showCloseButton off): keeps title + X on one flex row so they
          align vertically (issue 4) and the title truncates reliably (issue 6). */}
      <DialogContent showCloseButton={false} className="sm:max-w-[600px] w-[90vw]">
        <DialogHeader className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ImageIcon size={16} aria-hidden="true" className="shrink-0" />
            <DialogTitle className="min-w-0 flex-1 truncate">
              {fileName ?? t('file.viewer.title')}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label={t('file.viewer.close')}
              className="-mr-1 shrink-0"
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div className="px-6 py-2">
          <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded bg-muted">
            {preview}
          </div>
        </div>

        {/* flex-col (not the default flex-col-reverse) so the left item (meta) sits on TOP
            when stacked; sm:justify-between for meta-left / actions-right on desktop. */}
        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          {/* Meta badges — top on mobile, left on desktop */}
          <div className="flex items-center gap-2">
            {fileSize && (
              <Badge variant="secondary" title={t('file.viewer.size')}>
                {fileSize}
              </Badge>
            )}
            {dimension && (
              <Badge variant="secondary" title={t('file.viewer.dimension')}>
                {dimension}
              </Badge>
            )}
          </div>

          {/* Actions — below on mobile (full-width stacked; flex-col-reverse puts download on top,
              close below, matching the description dialog) / right on desktop (close, download) */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              {t('file.viewer.close')}
            </Button>
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
              onClick={onDownload}
              disabled={!onDownload}
            >
              {t('file.viewer.download')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
