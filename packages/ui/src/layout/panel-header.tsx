import type { ReactNode } from "react";

import { XIcon } from "../crud/shared/icons";
import { useFlatUIComponents } from "../provider/ui-provider";
import { Flex } from "../primitives/flex";
import { Heading } from "../primitives/heading";
import { Stack } from "../primitives/stack";

export interface PanelHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
  children?: ReactNode;
}

export function PanelHeader({ title, description, onClose, children }: PanelHeaderProps) {
  const { Button } = useFlatUIComponents();

  return (
    <Flex align="center" gap="sm" className="border-b px-0 py-4 shrink-0">
      <Stack gap="none" className="flex-1 min-w-0">
        <Heading level={3} className="truncate">{title}</Heading>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </Stack>
      {children}
      {onClose && (
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <XIcon className="size-3" />
        </Button>
      )}
    </Flex>
  );
}
