import { useCallback, useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../base/inputs/command";
import { Label } from "../../base/controls/label";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";
import { useCountryOptions } from "../../utils/use-country-options";
import { CheckIcon } from "../shared/icons";
import { FieldClearButton } from "./field-clear-button";
import { SearchOperator } from "./filter-types";
import { makeFilterKey } from "./filter-utils";
import type { CrudListFilters } from "../list/use-crud-list";

export function CountryFormField({
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
  const { t } = useTranslation("simplix/ui");
  const options = useCountryOptions();
  const key = makeFilterKey(field, SearchOperator.IN);
  const rawValue = state.values[key];
  const selectedValues = useMemo(
    () => new Set(Array.isArray(rawValue) ? (rawValue as string[]) : []),
    [rawValue],
  );

  const handleSelect = useCallback(
    (code: string) => {
      const next = new Set(selectedValues);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      state.setValue(key, next.size === 0 ? undefined : [...next]);
    },
    [selectedValues, state, key],
  );

  const filterFn = useCallback(
    (value: string, search: string): number => {
      const lower = search.toLowerCase();
      const option = options.find((o) => o.code === value);
      if (!option) return 0;
      if (option.code.toLowerCase().includes(lower)) return 1;
      if (option.localName.toLowerCase().includes(lower)) return 1;
      if (option.englishName.toLowerCase().includes(lower)) return 1;
      return 0;
    },
    [options],
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
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selectedValues.has(option.code);
              return (
                <CommandItem
                  key={option.code}
                  value={option.code}
                  onSelect={() => handleSelect(option.code)}
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
                  <option.Flag className="mr-2 h-3 w-4.5 rounded-[1px]" />
                  <span>{option.localName}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </Stack>
  );
}
