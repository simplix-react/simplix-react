
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react'
import { all, createLowlight } from 'lowlight'

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '../components/code-node'

// Create lowlight instance with all languages
const lowlight = createLowlight(all)

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
