import type { ReactNode } from "react";

import { Flex } from "../primitives/flex";
import { cn } from "../utils/cn";

export interface EditorFooterProps {
  children: ReactNode;
  className?: string;
}

export function EditorFooter({ children, className }: EditorFooterProps) {
  return (
    <Flex justify="between" align="center" className={cn("shrink-0 border-t px-5 py-3", className)}>
      {children}
    </Flex>
  );
}
