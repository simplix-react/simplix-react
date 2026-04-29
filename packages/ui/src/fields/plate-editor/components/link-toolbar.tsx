
import { Link, Unlink, ExternalLink } from 'lucide-react'
import {
  useFloatingLinkEditState,
  useFloatingLinkEdit,
  useFloatingLinkInsertState,
  useFloatingLinkInsert,
} from '@platejs/link/react'
import { flip, shift, offset } from '@platejs/floating'
import { useEditorSelector } from 'platejs/react'
import { KEYS } from 'platejs'
import { cn } from '../../../utils/cn'
import { Input } from '../../../base/inputs/input'
import { Button } from '../../../base/controls/button'
import { Separator } from '../../../base/display/separator'
import { useTranslation } from '@simplix-react/i18n/react'

// Floating options to keep toolbar within editor bounds
const floatingOptions = {
  middleware: [
    offset(8),
    flip({ padding: 12 }),
    shift({ padding: 12 }),
  ],
}

/**
 * Floating toolbar for link insertion
 */
export function LinkInsertToolbar() {
  const { t } = useTranslation("simplix/ui")
  const insertState = useFloatingLinkInsertState({ floatingOptions })
  const {
    props: insertProps,
    ref: insertRef,
  } = useFloatingLinkInsert(insertState)

  return (
    <div
      ref={insertRef}
      className={cn(
        'z-50 flex items-center gap-2 rounded-md border bg-popover p-2 shadow-md',
        'animate-in fade-in-0 zoom-in-95'
      )}
      {...insertProps}
    >
      <Input
        placeholder={t('plateEditor.link.placeholder')}
        className="h-8 w-60 text-sm"
      />
      <Button size="sm" variant="default" className="h-8">
        <Link className="h-4 w-4 mr-1" />
        {t('plateEditor.link.insert')}
      </Button>
    </div>
  )
}

/**
 * Floating toolbar for editing existing links
 */
export function LinkEditToolbar() {
  const { t } = useTranslation("simplix/ui")
  const editState = useFloatingLinkEditState({ floatingOptions })
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState)

  const linkUrl = useEditorSelector((editor) => {
    const entry = editor.api.node({ above: true, match: { type: KEYS.link } })
    const node = entry?.[0] as { url?: string } | undefined
    return node?.url
  }, [])

  return (
    <div
      ref={editRef}
      className={cn(
        'z-50 flex items-center gap-2 rounded-md border bg-popover p-2 shadow-md',
        'animate-in fade-in-0 zoom-in-95'
      )}
      {...editProps}
    >
      <Button
        size="sm"
        variant="ghost"
        className="h-8"
        {...editButtonProps}
      >
        <Link className="h-4 w-4 mr-1" />
        {t('plateEditor.link.edit')}
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-destructive hover:text-destructive"
        {...unlinkButtonProps}
      >
        <Unlink className="h-4 w-4 mr-1" />
        {t('plateEditor.link.unlink')}
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <a
        href={linkUrl ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!linkUrl}
        tabIndex={linkUrl ? 0 : -1}
        onClick={(e) => {
          if (!linkUrl) e.preventDefault()
        }}
        className={cn(
          'inline-flex h-8 items-center justify-center rounded px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
          !linkUrl && 'pointer-events-none opacity-50'
        )}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}

/**
 * Combined floating toolbar for links (renders both insert and edit toolbars)
 * Plate.js handles visibility internally through the floating UI state
 */
export function LinkFloatingToolbar() {
  return (
    <>
      <LinkInsertToolbar />
      <LinkEditToolbar />
    </>
  )
}
