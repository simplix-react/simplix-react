import { useCallback, useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { type TimezoneOption, useTimezoneOptions } from "../../utils/use-timezone-options";
import { CheckIcon } from "../shared/icons";
import { FieldClearButton } from "./field-clear-button";
import { SearchOperator } from "./filter-types";
import { makeFilterKey } from "./filter-utils";
import type { CrudListFilters } from "../list/use-crud-list";

export function TimezoneFormField({
  field,
  label,
  state,
  className,
}: {
  field: string;
  label: string;
  state: CrudListFilters;
  className?: string;
}) {
  const { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Label } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const { groups } = useTimezoneOptions();
  const key = makeFilterKey(field, SearchOperator.IN);
  const rawValue = state.values[key];
  const selectedValues = useMemo(
    () => new Set(Array.isArray(rawValue) ? (rawValue as string[]) : []),
    [rawValue],
  );

  const allOptions = useMemo(() => {
    const all: TimezoneOption[] = [];
    for (const [, opts] of groups) {
      all.push(...opts);
    }
    return all;
  }, [groups]);

  const handleSelect = useCallback(
    (tz: string) => {
      const next = new Set(selectedValues);
      if (next.has(tz)) {
        next.delete(tz);
      } else {
        next.add(tz);
      }
      state.setValue(key, next.size === 0 ? undefined : [...next]);
    },
    [selectedValues, state, key],
  );

  const filterFn = useCallback(
    (value: string, search: string): number => {
      const lower = search.toLowerCase();
      const option = allOptions.find((o) => o.value === value);
      if (!option) return 0;
      if (option.value.toLowerCase().includes(lower)) return 1;
      if (option.label.toLowerCase().includes(lower)) return 1;
      if (option.localizedName.toLowerCase().includes(lower)) return 1;
      return 0;
    },
    [allOptions],
  );

  return (
    <Stack gap="xs" className={className}>
      <Flex align="center" justify="between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={label} />}
      </Flex>
      <Command filter={filterFn} className="rounded-md border">
        <CommandInput placeholder={label} className="h-8" />
        <CommandList className="max-h-[160px]">
          <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
          {[...groups.entries()].map(([region, opts]) => (
            <CommandGroup key={region} heading={region}>
              {opts.map((option) => {
                const isSelected = selectedValues.has(option.value);
                const showLocal = option.localizedName && option.localizedName !== option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <span
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm">{option.label}</span>
                      {showLocal && <span className="text-xs text-muted-foreground">{option.localizedName}</span>}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </Stack>
  );
}
