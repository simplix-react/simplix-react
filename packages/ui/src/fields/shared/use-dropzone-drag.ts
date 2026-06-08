import { useState } from "react";

/** Options for {@link useDropzoneDrag}. */
export interface UseDropzoneDragOptions {
  /** Called with the dropped files on a `drop` event. */
  onFiles: (files: FileList | null) => void;
  /** When true, suppresses drag-over highlight and the `onFiles` callback. */
  disabled?: boolean;
}

/** Drag handlers spread onto the dropzone container element. */
export interface DropzoneDragProps {
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

/** Return shape of {@link useDropzoneDrag}. */
export interface UseDropzoneDragResult {
  /** Whether a drag is currently hovering the dropzone. */
  isDragOver: boolean;
  /** Drag handlers to spread onto the dropzone container. */
  dragProps: DropzoneDragProps;
  /** Resets a file input's value so re-selecting the same file fires `change`. */
  resetInput: (el: HTMLInputElement | null) => void;
}

/**
 * Shared drag-state core for dropzone atoms. Owns the `isDragOver` flag and the
 * dragOver / dragLeave / drop handlers, and exposes a helper to reset a file
 * input value. Render trees stay with each dropzone — this only unifies behavior.
 */
export function useDropzoneDrag({
  onFiles,
  disabled,
}: UseDropzoneDragOptions): UseDropzoneDragResult {
  const [isDragOver, setIsDragOver] = useState(false);

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function onDragLeave() {
    setIsDragOver(false);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) onFiles(e.dataTransfer.files);
  }

  function resetInput(el: HTMLInputElement | null) {
    if (el) el.value = "";
  }

  return {
    isDragOver,
    dragProps: { onDragOver, onDragLeave, onDrop },
    resetInput,
  };
}
