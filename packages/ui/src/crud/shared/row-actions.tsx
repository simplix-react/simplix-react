import { useTranslation } from "@simplix-react/i18n/react";
import { MenuLink } from "../../menu/menu-link";
import { type MouseEvent, type ReactNode } from "react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { Flex } from "../../primitives";
import { cn } from "../../utils/cn";
import {
  ArrowUpDownIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  FolderTreeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UnlinkIcon,
} from "./icons";

/** Row-level action kinds a list or tree row can offer. */
export type ActionType = "view" | "edit" | "delete" | "duplicate" | "locate" | "add-child" | "reorder" | "move" | "unlink" | "select";

/** How the action cluster renders: labelled buttons (outline/ghost) or a compact icon strip. */
export type ActionVariant = "outline" | "ghost" | "icon";

/** One row action. `label`/`icon` fall back to the type's defaults when omitted. */
export interface RowActionDef<T> {
  type: ActionType;
  onClick: (row: T) => void;
  label?: string;
  icon?: ReactNode | ((row: T) => ReactNode);
  when?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  /**
   * Why this row cannot take the action, when it cannot.
   *
   * <p><b>A disabled control that does not say why is a dead end.</b> The reader presses, nothing
   * happens, and they have no way to tell whether the record is in the wrong state, whether they
   * lack the permission, or whether the product is broken — and the three call for three different
   * next moves. Returning a sentence puts it in the tooltip, on the same control they pressed.
   *
   * <p>Read only when `disabled` says so, so a row that can act carries no tooltip it does not
   * need. Where the reason is the same for every row, a constant string is what the function
   * returns.
   */
  disabledReason?: (row: T) => string | undefined;
  /**
   * Where the action takes the reader, when it is a destination rather than a change.
   *
   * <p><b>A row that says 「가서 보기」 is still a row action.</b> Given `onClick` alone it is a
   * button that navigates, which reads to the browser as a press — no middle-click, no open in a
   * new tab, no address on hover. Given this it is a link wearing the action's shape, so the
   * column stays one thing and the reader keeps what a link gives them.
   *
   * <p>`onClick` is still called where both are given, for a screen that has to record the
   * departure. A disabled action never navigates.
   */
  href?: (row: T) => string | undefined;
}

const ACTION_LABEL_KEYS: Record<ActionType, string> = {
  view: "common.view",
  edit: "common.edit",
  delete: "common.delete",
  duplicate: "common.duplicate",
  locate: "common.locate",
  "add-child": "tree.addChild",
  reorder: "tree.reorder",
  move: "tree.move",
  unlink: "common.unlink",
  select: "common.select",
};

const ACTION_ICONS: Record<ActionType, ReactNode> = {
  view: <EyeIcon className="size-4" />,
  edit: <PencilIcon className="size-4" />,
  delete: <TrashIcon className="size-4" />,
  duplicate: <CopyIcon className="size-4" />,
  locate: <MapPinIcon className="size-4" />,
  "add-child": <PlusIcon className="size-4" />,
  reorder: <ArrowUpDownIcon className="size-4" />,
  move: <FolderTreeIcon className="size-4" />,
  unlink: <UnlinkIcon className="size-4" />,
  select: <CheckIcon className="size-4" />,
};

/**
 * Column width the action cluster needs for the given variant.
 *
 * <p><b>The labelled variants scale with the action count, same as the icon one.</b> A flat width
 * held for every count is right only at one count: two labelled buttons measure 157px of content
 * before the cell's own padding, so a column fixed at the one-button width puts the second button
 * past the cell and the reader finds it by scrolling a table that gives no sign of scrolling. The
 * numbers are measured off a `size="xs"` button carrying an icon and a two-to-four syllable label,
 * which is what a console row draws.
 *
 * <p><b>The one-button case keeps the old width as a floor</b>, because a single long label is
 * wider than the average this is built from and there is nothing beside it to reveal the clip.
 *
 * @param actions every action declared for the row, including the ones a given row hides
 * @param variant how the cluster renders — bare glyphs, or buttons carrying their labels
 * @returns the column width in px
 */
export function getActionColumnWidth(actions: RowActionDef<unknown>[], variant: ActionVariant): number {
  if (variant === "icon") return actions.length * 30 + 4;
  return Math.max(120, actions.length * 78 + (actions.length - 1) * 8 + 24);
}

/** Per-row action cluster shared by the list and tree tables. */
export function RowActionCell<T>({
  row,
  actions,
  variant,
  size = "xs",
}: {
  row: T;
  actions: RowActionDef<T>[];
  variant: ActionVariant;
  /** Button size for the outline/ghost variant. Lists render `xs`, trees `sm`. */
  size?: "xs" | "sm";
}) {
  const { t } = useTranslation("simplix/ui");
  const { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } = useFlatUIComponents();
  const visible = actions.filter((a) => !a.when || a.when(row));
  if (visible.length === 0) return null;

  const handleClick = (e: MouseEvent, action: RowActionDef<T>) => {
    e.stopPropagation();
    action.onClick(row);
  };

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Flex justify="end" align="center">
          <div className="inline-flex items-center rounded-md border overflow-hidden">
            {visible.map((action, i) => {
              const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
              const resolvedIcon = typeof action.icon === "function" ? action.icon(row) : action.icon;
              const icon = resolvedIcon ?? ACTION_ICONS[action.type];
              const isDisabled = action.disabled?.(row) ?? false;
              return (
                <Tooltip key={`${action.type}-${i}`}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      // The button's only content is a mark, so without this it has no accessible
                      // name at all: a Radix tooltip describes a control while it is open, it does
                      // not name one, and a control nobody has hovered is never open. Assistive
                      // technology would announce every row's actions as unlabelled buttons.
                      aria-label={label}
                      className={cn(
                        "rounded-none",
                        i > 0 && "border-l",
                      )}
                      onClick={(e) => handleClick(e, action)}
                      disabled={isDisabled}
                    >
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </Flex>
      </TooltipProvider>
    );
  }

  // outline / ghost variant
  return (
    <TooltipProvider>
      <Flex gap="xs" justify="end">
        {visible.map((action, i) => {
          const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
          const resolvedIcon = typeof action.icon === "function" ? action.icon(row) : action.icon;
          const icon = resolvedIcon ?? ACTION_ICONS[action.type];
          const isDisabled = action.disabled?.(row) ?? false;
          const reason = isDisabled ? action.disabledReason?.(row) : undefined;
          const button = (
            <Button
              key={`${action.type}-${i}`}
              size={size}
              variant={variant}
              onClick={(e) => handleClick(e, action)}
              disabled={isDisabled}
            >
              {icon}
              {label}
            </Button>
          );
          // A destination is a link wearing the action's shape, so the reader keeps middle-click
          // and the address on hover — which a button that navigates takes from them.
          const href = isDisabled ? undefined : action.href?.(row);
          const control = href ? <MenuLink href={href}>{button}</MenuLink> : button;
          if (!reason) return control;
          // The disabled button swallows pointer events, so the tooltip hangs off a span around it
          // rather than off the button — without that wrapper the reason is unreachable, which is
          // the whole failure it exists to avoid.
          return (
            <Tooltip key={`${action.type}-${i}`}>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-default">{control}</span>
              </TooltipTrigger>
              <TooltipContent>{reason}</TooltipContent>
            </Tooltip>
          );
        })}
      </Flex>
    </TooltipProvider>
  );
}
