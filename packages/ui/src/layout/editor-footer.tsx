import type { ReactNode } from "react";

import { slotAttributes } from "../design/slot-style";
import { editorFooterStyle } from "./editor-footer.style";
import { cn } from "../utils/cn";

export interface EditorFooterProps {
  children: ReactNode;
  className?: string;
}

export function EditorFooter({ children, className }: EditorFooterProps) {
  return (
    <div
      className={cn("flex flex-row items-center justify-between shrink-0", className)}
      {...slotAttributes(editorFooterStyle, {})}
    >
      {children}
    </div>
  );
}
