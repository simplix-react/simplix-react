
import { LinkPlugin } from '@platejs/link/react'

import { LinkElement } from '../components/link-node'
import { LinkFloatingToolbar } from '../components/link-toolbar'

/**
 * Link functionality with floating toolbar
 */
export const LinkKit = [
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
]
