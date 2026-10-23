import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { CaretDownIcon, XIcon } from "../shared/icons";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import { operatorConfig } from "./filter-icons";
import {
  crudFilterInputRowStyle,
  crudFilterOperatorMenuStyle,
  crudFilterOperatorTriggerStyle,
} from "./filter-parts.style";
import type { SearchOperator } from "./filter-types";
import { crudUnifiedTextOperatorStyle } from "./unified-text-filter.style";

export interface UnifiedTextFilterField {
  field: string;
  label: string;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
}

export interface UnifiedTextFilterProps {
  fields: UnifiedTextFilterField[];
  selectedField: string;
  value: string;
  operator: SearchOperator;
  onFieldChange: (field: string) => void;
  onChange: (value: string) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  width?: string | number;
  className?: string;
}

export function UnifiedTextFilter({
  fields,
  selectedField,
  value,
  operator,
  onFieldChange,
  onChange,
  onOperatorChange,
  width,
  className,
}: UnifiedTextFilterProps) {
  const { Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const [inputValue, setInputValue] = useState(value);
  const isUserInteracting = useRef(false);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeField = fields.find((f) => f.field === selectedField) ?? fields[0];
  const currentOp = operatorConfig[operator];

  // Sync external value when NOT interacting
  useEffect(() => {
    if (!isUserInteracting.current) {
      setInputValue(value);
    }
  }, [value]);

  const markInteracting = useCallback(() => {
    isUserInteracting.current = true;
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 100);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (interactionTimer.current) clearTimeout(interactionTimer.current);
    };
  }, []);

  const handleInputChange = useCallback(
    (newValue: string) => {
      markInteracting();
      setInputValue(newValue);
      onChange(newValue);
    },
    [onChange, markInteracting],
  );

  const handleFieldChange = useCallback(
    (newField: string) => {
      const newFieldDef = fields.find((f) => f.field === newField);
      if (!newFieldDef) return;

      // Check if current operator is available in new field
      if (!newFieldDef.operators.includes(operator)) {
        onOperatorChange(newFieldDef.defaultOperator ?? newFieldDef.operators[0]);
      }
      onFieldChange(newField);
    },
    [fields, operator, onFieldChange, onOperatorChange],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
  }, [onChange]);

  return (
    <div
      className={cn("relative flex flex-row items-center", className)}
      {...slotAttributes(crudFilterInputRowStyle, { lead: "both" })}
      style={width ? { width: typeof width === "number" ? `${width}px` : width } : undefined}
    >
      {/* Field selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="absolute left-0 z-10 inline-flex h-8 items-center"
            {...slotAttributes(crudFilterOperatorTriggerStyle, { attach: "joined", labelled: true })}
          >
            {activeField?.label}
            <CaretDownIcon className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <div {...slotAttributes(crudFilterOperatorMenuStyle, {})}>
            {fields.map((f) => (
              <DropdownMenuItem
                key={f.field}
                onClick={() => handleFieldChange(f.field)}
                data-current={f.field === selectedField}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Operator selector */}
      {activeField && activeField.operators.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-20 z-10 inline-flex h-8 w-10 items-center justify-center"
              aria-label={t("filter.selectOperator")}
              {...slotAttributes(crudUnifiedTextOperatorStyle, { interactive: true })}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div {...slotAttributes(crudFilterOperatorMenuStyle, {})}>
              {activeField.operators.map((op) => {
                const meta = operatorConfig[op];
                return (
                  <DropdownMenuItem
                    key={op}
                    onClick={() => onOperatorChange(op)}
                    data-current={op === operator}
                  >
                    <meta.icon className="h-3.5 w-3.5" />
                    {t(meta.labelKey)}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : activeField ? (
        <span
          className="absolute left-20 inline-flex h-8 w-10 items-center justify-center"
          {...slotAttributes(crudUnifiedTextOperatorStyle, { interactive: false })}
        >
          <currentOp.icon className="h-3.5 w-3.5" />
        </span>
      ) : null}

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={activeField?.label}
        className="h-8"
        aria-label={activeField?.label}
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
