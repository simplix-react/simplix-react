import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../utils/cn";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { dragHandleGripStyle, dragHandleHeaderStyle, dragHandleStyle } from "./drag-handle.style";
import { useFlatUIComponents } from "../../provider/ui-provider";

interface DragHandleCellProps {
  disabled?: boolean;
  /**
   * Why the handle is inert, from the caller that knows. Nothing here can say it: a file list
   * disables the handle while an upload is in flight or has failed, a record list disables it for
   * reasons of its own, and a wrong explanation is worse than none. Omit it and the dead grip stays
   * a silent decoration.
   */
  disabledLabel?: string;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
}

function GripIcon({ muted }: { muted?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      {...slotAttributes(dragHandleGripStyle, { muted })}
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

export function DragHandleCell({ disabled, disabledLabel, listeners, attributes }: DragHandleCellProps) {
  const { t } = useTranslation("simplix/ui");

  if (disabled) {
    if (!disabledLabel) {
      return <GripIcon muted />;
    }
    return (
      <span role="img" aria-label={disabledLabel} title={disabledLabel} className="inline-flex">
        <GripIcon muted />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={t("file.handle.reorder")}
      className="inline-flex cursor-grab items-center justify-center"
      {...listeners}
      {...attributes}
      {...slotAttributes(dragHandleStyle, {})}
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
  const { t } = useTranslation("simplix/ui");
  const label = t("list.sortByDisplayOrder");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={isDragEnabled ? undefined : onActivate}
      disabled={isDragEnabled}
      className={cn(isDragEnabled && "pointer-events-none")}
      {...partAttributes(dragHandleHeaderStyle, { engaged: isDragEnabled })}
      aria-label={label}
      title={label}
    >
      <ArrowDown01Icon />
    </Button>
  );
}
