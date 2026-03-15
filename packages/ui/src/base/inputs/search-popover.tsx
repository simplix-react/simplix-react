import { useTranslation } from "@simplix-react/i18n/react";
import { useMemo, useState } from "react";

import { Button } from "../controls/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../overlay/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";

// ── Icons ──

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

// ── Types ──

/** A group of items with a label header. */
export interface SearchPopoverGroup<T> {
  /** Display label for the group header. */
  label: string;
  /** Items within this group. */
  items: T[];
}

/** Props for the {@link SearchPopover} component. */
export interface SearchPopoverProps<T> {
  /** Text displayed on the trigger button. */
  triggerText: string;
  /** Flat list of items (mutually exclusive with `groups`). */
  items?: T[];
  /** Grouped list of items (mutually exclusive with `items`). */
  groups?: SearchPopoverGroup<T>[];
  /** Extract display label from an item. */
  getLabel: (item: T) => string;
  /** Extract unique key from an item. */
  getKey: (item: T) => string;
  /** Called when an item is selected. */
  onSelect: (item: T) => void;
  /** Whether the trigger button is disabled. */
  disabled?: boolean;
  /** Tooltip text when disabled (e.g. max items reached). */
  disabledReason?: string;
  /** Search input placeholder. Defaults to i18n `field.searchOption`. */
  placeholder?: string;
  /** Message when no items match the search. Defaults to i18n `field.noResults`. */
  emptyMessage?: string;
  /** Popover alignment. Defaults to `"end"`. */
  align?: "start" | "center" | "end";
}

/**
 * Searchable popover for selecting items from a flat or grouped list.
 * Uses a unified trigger button design with PlusIcon.
 *
 * @example
 * ```tsx
 * // Flat list
 * <SearchPopover
 *   triggerText="Assign Level"
 *   items={availableLevels}
 *   getLabel={(l) => l.name}
 *   getKey={(l) => l.id}
 *   onSelect={(l) => handleAssign(l.id)}
 * />
 *
 * // Grouped list
 * <SearchPopover
 *   triggerText="Assign Door"
 *   groups={[
 *     { label: "Controller A", items: doorsA },
 *     { label: "Controller B", items: doorsB },
 *   ]}
 *   getLabel={(d) => d.name}
 *   getKey={(d) => d.id}
 *   onSelect={(d) => handleAdd(d.id)}
 * />
 * ```
 */
export function SearchPopover<T>({
  triggerText,
  items,
  groups,
  getLabel,
  getKey,
  onSelect,
  disabled = false,
  disabledReason,
  placeholder,
  emptyMessage,
  align = "end",
}: SearchPopoverProps<T>) {
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);

  const searchPlaceholder = placeholder ?? t("field.searchOption");
  const noResultsMessage = emptyMessage ?? t("field.noResults");

  const allItems = useMemo(() => {
    if (items) return items;
    if (groups) return groups.flatMap((g) => g.items);
    return [];
  }, [items, groups]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
        >
          <PlusIcon />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align={align}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsMessage}</CommandEmpty>
            {items ? (
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={getKey(item)}
                    value={getLabel(item)}
                    onSelect={() => handleSelect(item)}
                  >
                    {getLabel(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : groups ? (
              groups.map((group, i) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {i > 0 && <CommandSeparator />}
                  {group.items.map((item) => (
                    <CommandItem
                      key={getKey(item)}
                      value={getLabel(item)}
                      onSelect={() => handleSelect(item)}
                    >
                      {getLabel(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
