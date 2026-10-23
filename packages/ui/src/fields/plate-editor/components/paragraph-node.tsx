import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { plateParagraphStyle } from './paragraph-node.style'

export function ParagraphElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="p" className={className} {...props} attributes={{ ...props.attributes, ...slotAttributes(plateParagraphStyle, {}) }} />
  )
}
