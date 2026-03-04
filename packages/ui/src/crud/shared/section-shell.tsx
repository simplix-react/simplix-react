import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { type ReactNode, useState } from "react";

import { Button } from "../../base";
import { Flex } from "../../primitives";
import { Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import { CaretDownIcon } from "./icons";

// variant="card" (default)
//
// ┌─ sectionTitle ─────────────────────────┐
// │ <h3>Section Title</h3>                 │
// │                                        │
// │ ┌─ <section> rounded border shadow ──┐ │
// │ │ ┌────────────────────────────────┐ │ │
// │ │ │ Header  (bg-muted/50, border-b)│ │ │
// │ │ │                                │ │ │
// │ │ │ <h4> title  ▸icon ▸text        │ │ │
// │ │ │ description (muted)            │ │ │
// │ │ │                    [trailing]  │ │ │
// │ │ │                    [▼ toggle]  │ │ │
// │ │ └────────────────────────────────┘ │ │
// │ │ ┌────────────────────────────────┐ │ │
// │ │ │ Body  (px-4 py-3)              │ │ │
// │ │ │  {children}                    │ │ │
// │ │ └────────────────────────────────┘ │ │
// │ └────────────────────────────────────┘ │
// └────────────────────────────────────────┘
//
// variant="flat"
//
// ┌─ <section> border-b, no shadow ────────┐
// │ ┌────────────────────────────────────┐ │
// │ │ Header  (pl-2, no bg)              │ │
// │ │                                    │ │
// │ │ <h3> title (text-lg)  [trailing]   │ │
// │ │ description (muted)   [▼ toggle]   │ │
// │ └────────────────────────────────────┘ │
// │ ┌────────────────────────────────────┐ │
// │ │ Body  (pl-2)                       │ │
// │ │  {children}                        │ │
// │ └────────────────────────────────────┘ │
// └────────────────────────────────────────┘
//
// collapsible=true → Body wraps in Collapsible.Content (animate up/down)

/** Shared props for section components (CrudDetail.Section, CrudForm.Section). */
export interface SectionShellProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Group title rendered above the card. */
  sectionTitle?: ReactNode;
  /** Visual style: `"card"` (default) renders with border and shadow, `"flat"` renders without. */
  variant?: "card" | "flat";
  /** Content rendered on the right side of the section header. */
  trailing?: ReactNode;
  /** Enable collapsible behavior (default: false). */
  collapsible?: boolean;
  /** Initial open state when collapsible (default: true). */
  defaultOpen?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SectionShell({
  title,
  description,
  sectionTitle,
  variant = "card",
  trailing,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}: SectionShellProps) {
  const [open, setOpen] = useState(defaultOpen);

  const TitleTag = sectionTitle ? "h4" : "h3";
  const isCard = variant === "card";
  const titleClass = isCard
    ? "text-sm font-semibold tracking-tight"
    : "text-lg font-semibold tracking-tight";
  const headerContent = (
    <Stack gap="xs">
      <Flex align="center" justify="between">
        <TitleTag className={cn(titleClass, "inline-flex items-center gap-1.5")}>{title}</TitleTag>
        {(trailing || collapsible) && (
          <Flex align="center" gap="xs">
            {trailing}
            {collapsible && (
              <CollapsiblePrimitive.Trigger asChild>
                <Button type="button" variant="ghost" size="icon-xs">
                  <CaretDownIcon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      !open && "-rotate-90",
                    )}
                  />
                </Button>
              </CollapsiblePrimitive.Trigger>
            )}
          </Flex>
        )}
      </Flex>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </Stack>
  );

  const header = isCard ? (
    <div className="rounded-t-lg border-b bg-muted/50 pl-4 pr-2 py-1">
      {headerContent}
    </div>
  ) : (
    <div className="pl-2">{headerContent}</div>
  );

  const body = isCard ? (
    <div className="px-4 py-3">{children}</div>
  ) : (
    <div>{children}</div>
  );

  const showHeader = title || trailing || collapsible;

  const cardInner = collapsible ? (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      {showHeader && header}
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {body}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  ) : (
    <>
      {showHeader && header}
      {body}
    </>
  );

  const section = (
    <section
      className={cn(
        isCard &&
          "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        !isCard && "flex flex-col gap-4 pb-2 border-b border-border/50 last:border-b-0 last:pb-0",
        className,
      )}
    >
      {cardInner}
    </section>
  );

  if (sectionTitle) {
    return (
      <Stack gap="sm">
        <h3 className="text-lg font-semibold tracking-tight">{sectionTitle}</h3>
        {section}
      </Stack>
    );
  }

  return section;
}
