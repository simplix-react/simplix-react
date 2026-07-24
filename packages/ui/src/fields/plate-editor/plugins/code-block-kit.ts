
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react'
import { common, createLowlight } from 'lowlight'

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '../components/code-node'

// Common language set only — the full grammar registry is several times larger
// and dominates the bundle for consumers that merely render rich text.
const lowlight = createLowlight(common)

/**
 * Code block with syntax highlighting
 * Uses lowlight for syntax highlighting
 */
export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    node: { component: CodeBlockElement },
    options: { lowlight },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
]
