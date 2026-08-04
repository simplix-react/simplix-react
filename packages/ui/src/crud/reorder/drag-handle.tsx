import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../utils/cn";
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

export function DragHandleCell({ disabled, disabledLabel, listeners, attributes }: DragHandleCellProps) {
  const { t } = useTranslation("simplix/ui");

  if (disabled) {
    if (!disabledLabel) {
      return <GripIcon className="text-muted-foreground/30" />;
    }
    return (
      <span role="img" aria-label={disabledLabel} title={disabledLabel} className="inline-flex">
        <GripIcon className="text-muted-foreground/30" />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={t("file.handle.reorder")}
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
  const { t } = useTranslation("simplix/ui");
  const label = t("list.sortByDisplayOrder");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={isDragEnabled ? undefined : onActivate}
      disabled={isDragEnabled}
      className={cn(isDragEnabled && "pointer-events-none opacity-100")}
      aria-label={label}
      title={label}
    >
      <ArrowDown01Icon />
    </Button>
  );
}
