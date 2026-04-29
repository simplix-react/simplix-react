
import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { cn } from '../../../utils/cn'

export function ParagraphElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="p" className={cn('my-2', className)} {...props} />
  )
}
