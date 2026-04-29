
import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { cn } from '../../../utils/cn'

export function BlockquoteElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      className={cn(
        'my-4 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}
