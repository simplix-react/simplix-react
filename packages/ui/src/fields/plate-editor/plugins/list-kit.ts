
import { IndentPlugin } from '@platejs/indent/react'
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@platejs/list-classic/react'
import { KEYS } from 'platejs'

import {
  BulletedListElement,
  NumberedListElement,
  ListItemElement,
  ListItemContentElement,
} from '../components/list-node'

/**
 * Indent kit for list indentation
 */
export const IndentKit = [
  IndentPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
      ],
    },
  }),
]

/**
 * List functionality (Classic HTML lists: ul, ol, li)
 * Includes: Bullet list, Numbered list with indentation support
 */
export const ListKit = [
  ...IndentKit,
  ListPlugin,
  ListItemContentPlugin.withComponent(ListItemContentElement),
  BulletedListPlugin.configure({
    node: { component: BulletedListElement },
    shortcuts: { toggle: { keys: 'mod+alt+5' } },
  }),
  NumberedListPlugin.configure({
    node: { component: NumberedListElement },
    shortcuts: { toggle: { keys: 'mod+alt+6' } },
  }),
  ListItemPlugin.withComponent(ListItemElement),
]
