import { useTranslation } from "@simplix-react/i18n/react";
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

/** Column width the action cluster needs for the given variant. */
export function getActionColumnWidth(actions: RowActionDef<unknown>[], variant: ActionVariant): number {
  if (variant === "icon") return actions.length * 30 + 4;
  return 120;
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
    <Flex gap="xs" justify="end">
      {visible.map((action, i) => {
        const label = action.label ?? t(ACTION_LABEL_KEYS[action.type]);
        const resolvedIcon = typeof action.icon === "function" ? action.icon(row) : action.icon;
        const icon = resolvedIcon ?? ACTION_ICONS[action.type];
        const isDisabled = action.disabled?.(row) ?? false;
        return (
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
      })}
    </Flex>
  );
}
