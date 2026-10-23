import type { ReactNode } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { slotAttributes } from '../../../design/slot-style'
import {
  emptyPlaceholderBodyStyle,
  emptyPlaceholderDescriptionStyle,
  emptyPlaceholderIconStyle,
  emptyPlaceholderStyle,
  emptyPlaceholderTitleStyle,
} from './empty-placeholder.style'

export interface EmptyPlaceholderProps {
  title?: string
  description?: string
  icon?: ReactNode
}

export function EmptyPlaceholder({ title, description, icon }: EmptyPlaceholderProps) {
  const { t } = useTranslation('simplix/ui')

  return (
    <div className="absolute inset-0 grid place-items-center" {...slotAttributes(emptyPlaceholderStyle, {})}>
      <div className="flex flex-col items-center" {...slotAttributes(emptyPlaceholderBodyStyle, {})}>
        {icon ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
            aria-hidden="true"
            {...slotAttributes(emptyPlaceholderIconStyle, {})}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
        <span {...slotAttributes(emptyPlaceholderTitleStyle, {})}>
          {title ?? t('file.stage.emptyTitle')}
        </span>
        <span {...slotAttributes(emptyPlaceholderDescriptionStyle, {})}>
          {description ?? t('file.stage.emptyDesc')}
        </span>
      </div>
    </div>
  )
}
