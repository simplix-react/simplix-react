import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { type ReactNode, useState } from "react";

import { Flex } from "../../primitives";
import { Stack } from "../../primitives";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { CaretDownIcon } from "./icons";
import {
  sectionShellBodyStyle,
  sectionShellCaretStyle,
  sectionShellCollapseStyle,
  sectionShellDescriptionStyle,
  sectionShellGroupTitleStyle,
  sectionShellHeaderStyle,
  sectionShellStyle,
  sectionShellTitleStyle,
} from "./section-shell.style";

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
// variant="lined"
//
// ┌─ <section> border-b, no shadow ────────┐
// │ ┌────────────────────────────────────┐ │
// │ │ Header  (no bg)                    │ │
// │ │                                    │ │
// │ │ <h3> title (text-lg)  [trailing]   │ │
// │ │ description (muted)   [▼ toggle]   │ │
// │ └────────────────────────────────────┘ │
// │ ┌────────────────────────────────────┐ │
// │ │ Body  (border-l pl-4)              │ │
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
  /** Visual style: `"card"` (default) renders with border and shadow, `"flat"` renders without, `"lined"` adds a left border on the body. */
  variant?: "card" | "flat" | "lined";
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
  const { Button } = useFlatUIComponents();
  const [open, setOpen] = useState(defaultOpen);

  const TitleTag = sectionTitle ? "h4" : "h3";
  const isCard = variant === "card";
  const isLined = variant === "lined";
  const headerContent = (
    <Stack gap="xs">
      <Flex align="center" justify="between">
        <TitleTag className="inline-flex items-center" {...slotAttributes(sectionShellTitleStyle, { variant })}>{title}</TitleTag>
        {(trailing || collapsible) && (
          <Flex align="center" gap="xs">
            {trailing}
            {collapsible && (
              <CollapsiblePrimitive.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-6"
                  aria-label={open ? "Collapse" : "Expand"}
                >
                  <CaretDownIcon
                    className={cn("h-4 w-4", !open && "-rotate-90")}
                    {...slotAttributes(sectionShellCaretStyle, {})}
                  />
                </Button>
              </CollapsiblePrimitive.Trigger>
            )}
          </Flex>
        )}
      </Flex>
      {description && (
        <p {...slotAttributes(sectionShellDescriptionStyle, {})}>{description}</p>
      )}
    </Stack>
  );

  const header = isCard ? (
    <div {...slotAttributes(sectionShellHeaderStyle, { variant })}>
      {headerContent}
    </div>
  ) : (
    <div {...slotAttributes(sectionShellHeaderStyle, { variant })}>{headerContent}</div>
  );

  const body = isCard ? (
    <div {...slotAttributes(sectionShellBodyStyle, { variant })}>{children}</div>
  ) : isLined ? (
    <div {...slotAttributes(sectionShellBodyStyle, { variant })}>{children}</div>
  ) : (
    <div {...slotAttributes(sectionShellBodyStyle, { variant })}>{children}</div>
  );

  const showHeader = title || trailing || collapsible;

  const cardInner = collapsible ? (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      {showHeader && header}
      <CollapsiblePrimitive.Content className="-m-[var(--focus-gutter)] overflow-hidden p-[var(--focus-gutter)] data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down" {...slotAttributes(sectionShellCollapseStyle, {})}>
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
        // The card clips its rounded corners; the clip edge sits one gutter outside the padding box so
        // the halo of a control on the section's edge is not shaved off.
        isCard && "overflow-clip [overflow-clip-margin:var(--focus-gutter)]",
        (variant === "flat" || isLined) && "flex flex-col",
        className,
      )}
      {...slotAttributes(sectionShellStyle, { variant })}
    >
      {cardInner}
    </section>
  );

  if (sectionTitle) {
    return (
      <Stack gap="sm">
        <h3 {...slotAttributes(sectionShellGroupTitleStyle, {})}>{sectionTitle}</h3>
        {section}
      </Stack>
    );
  }

  return section;
}
