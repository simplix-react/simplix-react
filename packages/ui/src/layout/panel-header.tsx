import type { ReactNode } from "react";

import { useTranslation } from "@simplix-react/i18n/react";

import { XIcon } from "../crud/shared/icons";
import { useFlatUIComponents } from "../provider/ui-provider";
import { cn } from "../utils/cn";
import { Flex } from "../primitives/flex";
import { Heading } from "../primitives/heading";
import { Stack } from "../primitives/stack";

export interface PanelHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
  children?: ReactNode;
  /** Optional thumbnail element rendered before the title. */
  thumbnail?: ReactNode;
  /** Optional trailing element rendered after children, before the close button. */
  trailing?: ReactNode;
  /** Additional border variant class name (e.g. color-coded bottom border). */
  borderVariant?: string;
}

export function PanelHeader({
  title,
  description,
  onClose,
  children,
  thumbnail,
  trailing,
  borderVariant,
}: PanelHeaderProps) {
  const { Button } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");

  return (
    <Flex align="center" gap="sm" className={cn("border-b px-0 py-4 shrink-0", borderVariant)}>
      {thumbnail}
      <Stack gap="none" className="flex-1 min-w-0">
        <Heading level={3} className="truncate">{title}</Heading>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </Stack>
      {children}
      {trailing}
      {onClose && (
        // Icon-only: without this the button has no accessible name at all, and a screen
        // reader announces the one way out of the panel as an unlabelled button.
        <Button variant="ghost" size="icon-xs" aria-label={t("common.close")} onClick={onClose}>
          <XIcon className="size-3" aria-hidden />
        </Button>
      )}
    </Flex>
  );
}
