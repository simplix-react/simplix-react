import type { ReactNode } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'

export interface EmptyPlaceholderProps {
  title?: string
  description?: string
  icon?: ReactNode
}

export function EmptyPlaceholder({ title, description, icon }: EmptyPlaceholderProps) {
  const { t } = useTranslation('simplix/ui')

  return (
    <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
      <div className="flex flex-col items-center gap-2 text-center p-5">
        {icon ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-muted-foreground"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
        <span className="text-[13.5px] font-semibold text-secondary-foreground">
          {title ?? t('file.stage.emptyTitle')}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {description ?? t('file.stage.emptyDesc')}
        </span>
      </div>
    </div>
  )
}
