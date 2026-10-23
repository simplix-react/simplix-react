import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { plateBlockquoteStyle } from './blockquote-node.style'

export function BlockquoteElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateBlockquoteStyle, {}) }}
    />
  )
}
