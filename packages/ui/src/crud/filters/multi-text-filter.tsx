import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "../shared/icons";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import {
  crudFilterInputRowStyle,
  crudFilterOperatorMenuStyle,
  crudFilterOperatorTriggerStyle,
} from "./filter-parts.style";

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
  const { Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = useFlatUIComponents();
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
    <div
      className={cn("relative flex flex-row items-center", className)}
      {...slotAttributes(crudFilterInputRowStyle, { lead: hasMultipleFields ? "field" : "icon" })}
    >
      {hasMultipleFields && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-0 z-10 inline-flex h-8 items-center"
              {...slotAttributes(crudFilterOperatorTriggerStyle, { attach: "joined", labelled: true })}
            >
              {activeFieldDef?.label}
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div {...slotAttributes(crudFilterOperatorMenuStyle, {})}>
              {fields.map((f) => (
                <DropdownMenuItem
                  key={f.field}
                  onClick={() => handleFieldSwitch(f.field)}
                  data-current={f.field === selectedField}
                >
                  {f.label}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <MagnifyingGlassIcon
        className={cn(
          "absolute h-4 w-4",
          hasMultipleFields ? "left-[calc(var(--trigger-width,4rem)+0.625rem)]" : "left-2.5",
        )}
      />
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={activeFieldDef?.placeholder ?? activeFieldDef?.label}
        className="h-8"
        aria-label={activeFieldDef?.label}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 inline-flex h-4 w-4 items-center justify-center"
          aria-label={t("filter.clearFilter")}
          {...slotAttributes(crudFieldClearButtonStyle, {})}
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
