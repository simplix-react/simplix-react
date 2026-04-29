
import { MentionPlugin, MentionInputPlugin } from '@platejs/mention/react'

import { MentionElement, MentionInputElement } from '../components/mention-node'
import type { MentionItem } from '../types'

/**
 * Mention search handler type
 */
export type MentionSearchHandler = (query: string) => Promise<MentionItem[]>

/**
 * Mention kit options
 */
export interface MentionKitOptions {
  /** Static mention data */
  data?: MentionItem[]
  /** Async search handler */
  searchHandler?: MentionSearchHandler
  /** Trigger character (default: '@') */
  trigger?: string
}

/**
 * Create mention kit with custom data or search handler
 * Note: data and searchHandler are stored for future use when implementing
 * mention suggestions UI component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMentionKit = (options?: MentionKitOptions): any[] => {
  const { trigger = '@' } = options || {}

  return [
    MentionPlugin.configure({
      node: { component: MentionElement },
      options: {
        trigger,
      },
    }),
    MentionInputPlugin.withComponent(MentionInputElement),
  ]
}

/**
 * Default mention kit without data
 * Mention suggestions will be empty
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MentionKit: any[] = createMentionKit()
