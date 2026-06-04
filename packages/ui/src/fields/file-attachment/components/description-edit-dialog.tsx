import { useEffect, useState } from 'react'
import { FileText, X } from 'lucide-react'
import type { LocaleCode, LocaleConfig } from '@simplix-react/i18n'
import { useTranslation } from '@simplix-react/i18n/react'
import { useFlatUIComponents } from '../../../provider/ui-provider'
import { I18nTextField } from '../../form/i18n-text-field'

export interface DescriptionEditDialogProps {
  open: boolean
  onClose: () => void
  onSave: (i18n: Record<string, string>) => void
  fileName?: string
  initialValue?: Record<string, string>
  languages: LocaleConfig[]
  initialLang?: LocaleCode
}

/**
 * i18n description edit dialog.
 *
 * Uses I18nTextField (form/i18n-text-field) for language-aware input.
 * The LanguageSelector is rendered inside I18nTextField's labelExtra slot.
 */
export function DescriptionEditDialog({
  open,
  onClose,
  onSave,
  fileName,
  initialValue,
  languages,
  initialLang,
}: DescriptionEditDialogProps) {
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

  const firstLang = languages[0]?.code as LocaleCode | undefined
  const [currentLang, setCurrentLang] = useState<LocaleCode>(
    initialLang ?? firstLang ?? ('en' as LocaleCode),
  )
  const [working, setWorking] = useState<Record<string, string>>({})

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setWorking(initialValue ?? {})
      setCurrentLang(initialLang ?? firstLang ?? ('en' as LocaleCode))
    }
  }, [open, initialValue, initialLang, firstLang])

  function handleSave() {
    onSave(working)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Custom close in-header: title + X share one flex row (vertical align) and the title truncates (issue 1). */}
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <FileText size={16} aria-hidden="true" className="shrink-0" />
            <DialogTitle className="min-w-0 flex-1 truncate">
              {fileName ?? t('file.description.title')}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label={t('file.description.close')}
              className="-mr-1 shrink-0"
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            {t('file.description.placeholder')}
          </DialogDescription>
        </DialogHeader>

        {/* py only — no horizontal padding so the i18n input is flush with header/footer (issue 2) */}
        <div className="py-1">
          <I18nTextField
            value={working as Record<LocaleCode, string>}
            onChange={(v) => setWorking(v)}
            languages={languages}
            selectedLanguage={currentLang}
            onLanguageChange={setCurrentLang}
            label={t('file.description.label')}
            placeholder={t('file.description.placeholder')}
            maxLength={100}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('file.description.cancel')}
          </Button>
          <Button type="button" variant="default" onClick={handleSave}>
            {t('file.description.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
