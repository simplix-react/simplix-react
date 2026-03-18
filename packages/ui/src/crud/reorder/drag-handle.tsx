import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";

interface DragHandleCellProps {
  disabled?: boolean;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5.5" cy="3.5" r="1" />
      <circle cx="10.5" cy="3.5" r="1" />
      <circle cx="5.5" cy="8" r="1" />
      <circle cx="10.5" cy="8" r="1" />
      <circle cx="5.5" cy="12.5" r="1" />
      <circle cx="10.5" cy="12.5" r="1" />
    </svg>
  );
}

export function DragHandleCell({ disabled, listeners, attributes }: DragHandleCellProps) {
  if (disabled) {
    return <GripIcon className="text-muted-foreground/30" />;
  }

  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-grab items-center justify-center rounded p-0.5",
        "text-muted-foreground hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      )}
      {...listeners}
      {...attributes}
    >
      <GripIcon />
    </button>
  );
}

function ArrowDown01Icon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <rect x="15" y="4" width="4" height="6" ry="2" />
      <path d="M17 20v-6h-2" />
      <path d="M15 20h4" />
    </svg>
  );
}

interface DragHandleHeaderProps {
  isDragEnabled: boolean;
  onActivate: () => void;
}

export function DragHandleHeader({ isDragEnabled, onActivate }: DragHandleHeaderProps) {
  const { Button } = useFlatUIComponents();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={isDragEnabled ? undefined : onActivate}
      disabled={isDragEnabled}
      className={cn(isDragEnabled && "pointer-events-none opacity-100")}
      title="Sort by display order"
    >
      <ArrowDown01Icon />
    </Button>
  );
}
