
import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { cn } from '../../../utils/cn'

/**
 * Horizontal rule element component
 * Note: Uses a div with border styling instead of <hr> to avoid React 19 void element issues
 */
export function HorizontalRuleElement({ className, children, ...props }: PlateElementProps) {
  return (
    <PlateElement className={cn('py-2', className)} {...props}>
      <div className="h-px w-full bg-border" contentEditable={false} />
      {children}
    </PlateElement>
  )
}
