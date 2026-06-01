import { useTranslation } from '@simplix-react/i18n/react'
import { useFlatUIComponents } from '../../../provider/ui-provider'

export interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  fileName?: string
  isDeleting?: boolean
}

/**
 * Delete confirmation dialog (UD-7).
 *
 * ★ UD-7: NOT matilo ConfirmDialog — uses useFlatUIComponents().Dialog (plan §6.6).
 * The caller wires onConfirm to removeItem(localId) and manages isDeleting state.
 */
export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  fileName,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation('simplix/ui')
  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
  } = useFlatUIComponents()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('file.remove.title')}</DialogTitle>
          <DialogDescription>
            {fileName ? (
              <>
                {t('file.remove.message', { fileName })}
              </>
            ) : (
              t('file.remove.message', { fileName: '' })
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            {t('file.remove.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('file.remove.deleting') : t('file.remove.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
