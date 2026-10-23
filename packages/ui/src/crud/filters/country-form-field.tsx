import { useCallback, useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Flex } from "../../primitives/flex";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { useCountryOptions } from "../../utils/use-country-options";
import { CheckIcon } from "../shared/icons";
import { crudCountryFlagStyle, crudFilterListFieldStyle } from "./country-form-field.style";
import { FieldClearButton } from "./field-clear-button";
import { crudFilterOptionCheckStyle } from "./filter-parts.style";
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
  const { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Label } = useFlatUIComponents();
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
    <div className={cn("flex flex-col", className)} {...slotAttributes(crudFilterListFieldStyle, {})}>
      <Flex align="center" justify="between">
        <Label>{label}</Label>
        {selectedValues.size > 0 && <FieldClearButton onClick={() => state.setValue(key, undefined)} label={label} />}
      </Flex>
      <Command filter={filterFn}>
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
                    className="flex h-4 w-4 items-center justify-center"
                    {...slotAttributes(crudFilterOptionCheckStyle, { selected: isSelected })}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="inline-flex" {...slotAttributes(crudCountryFlagStyle, {})}>
                    <option.Flag className="h-3 w-4.5" />
                  </span>
                  <span>{option.localName}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
