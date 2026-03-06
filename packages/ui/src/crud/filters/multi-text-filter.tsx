import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Input } from "../../base/inputs/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../base/navigation/dropdown-menu";
import { Flex } from "../../primitives/flex";
import { cn } from "../../utils/cn";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "../shared/icons";

export interface MultiTextFilterField {
  field: string;
  label: string;
  placeholder?: string;
}

export interface MultiTextFilterProps {
  fields: MultiTextFilterField[];
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onFieldSwitch?: (from: string, to: string) => void;
  className?: string;
}

export function MultiTextFilter({
  fields,
  values,
  onChange,
  onFieldSwitch,
  className,
}: MultiTextFilterProps) {
  const { t } = useTranslation("simplix/ui");
  // Auto-detect initial active field from non-empty values
  const initialField = useMemo(() => {
    const active = fields.find((f) => values[f.field]);
    return active?.field ?? fields[0]?.field ?? "";
  }, [fields, values]);

  const [selectedField, setSelectedField] = useState(initialField);
  const [inputValue, setInputValue] = useState(() => values[initialField] ?? "");

  const activeFieldDef = fields.find((f) => f.field === selectedField) ?? fields[0];
  const hasMultipleFields = fields.length > 1;

  const handleFieldSwitch = useCallback(
    (newField: string) => {
      const oldField = selectedField;
      if (oldField === newField) return;

      // Clear old field value
      onChange(oldField, "");
      // Carry input value to new field
      if (inputValue) {
        onChange(newField, inputValue);
      }
      onFieldSwitch?.(oldField, newField);
      setSelectedField(newField);
    },
    [selectedField, inputValue, onChange, onFieldSwitch],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      onChange(selectedField, value);
    },
    [selectedField, onChange],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange(selectedField, "");
  }, [selectedField, onChange]);

  // Sync external value changes
  useEffect(() => {
    const externalValue = values[selectedField] ?? "";
    if (externalValue !== inputValue) {
      setInputValue(externalValue);
    }
  }, [values, selectedField]); // inputValue intentionally excluded to avoid loops

  return (
    <Flex align="center" className={cn("relative", className)}>
      {hasMultipleFields && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-0 z-10 inline-flex h-8 items-center gap-0.5 rounded-l-md border-r bg-muted/50 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {activeFieldDef?.label}
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {fields.map((f) => (
              <DropdownMenuItem
                key={f.field}
                onClick={() => handleFieldSwitch(f.field)}
                className={cn(f.field === selectedField && "bg-accent")}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <MagnifyingGlassIcon
        className={cn(
          "absolute h-4 w-4 text-muted-foreground",
          hasMultipleFields ? "left-[calc(var(--trigger-width,4rem)+0.625rem)]" : "left-2.5",
        )}
      />
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={activeFieldDef?.placeholder ?? activeFieldDef?.label}
        className={cn(
          "h-8 pr-8 text-sm",
          hasMultipleFields ? "pl-24" : "pl-8",
        )}
        aria-label={activeFieldDef?.label}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          aria-label={t("filter.clearFilter")}
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </Flex>
  );
}
