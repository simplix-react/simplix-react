import { memo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { CustomDragLayer } from "./custom-drag-layer";

interface DndProviderWrapperProps {
  children: React.ReactNode;
}

/** Wraps the calendar in the HTML5 dnd backend and mounts the custom drag layer. */
export const DndProviderWrapper = memo(({ children }: DndProviderWrapperProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
      <CustomDragLayer />
    </DndProvider>
  );
});

DndProviderWrapper.displayName = "DndProviderWrapper";
