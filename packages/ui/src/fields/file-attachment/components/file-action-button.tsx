import { Download, SquarePen, Trash2, SquareArrowOutUpRight, RotateCw, X } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { useFlatUIComponents } from '../../../provider/ui-provider'

export type FileActionKind = 'download' | 'edit' | 'delete' | 'preview' | 'retry' | 'cancel'

export interface FileActionButtonProps {
  kind: FileActionKind
  label?: string
  disabled?: boolean
  onClick?: () => void
}

const ACTION_ICON: Record<FileActionKind, React.ElementType> = {
  download: Download,
  edit:     SquarePen,
  delete:   Trash2,
  preview:  SquareArrowOutUpRight,
  retry:    RotateCw,
  cancel:   X,
}

const ACTION_I18N_KEY: Record<FileActionKind, string> = {
  download: 'file.action.download',
  edit:     'file.action.edit',
  delete:   'file.action.delete',
  preview:  'file.action.preview',
  retry:    'file.action.retry',
  cancel:   'file.action.cancel',
}

/**
 * Icon-only action button for file list items.
 * 6 kinds: download, edit, delete, preview, retry, cancel.
 *
 * Icons: lucide-react (brief §B).
 * Labels: i18n via t() (brief §A).
 *
 * ★ UD-7: delete kind does NOT call removeItem directly.
 *   The caller wires onClick to open DeleteConfirmDialog.
 */
export function FileActionButton({ kind, label, disabled, onClick }: FileActionButtonProps) {
  const { Button } = useFlatUIComponents()
  const { t } = useTranslation('simplix/ui')
  const Icon = ACTION_ICON[kind]
  const ariaLabel = label ?? t(ACTION_I18N_KEY[kind])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-[30px]"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={15} aria-hidden="true" />
    </Button>
  )
}
