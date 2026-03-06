import { useCallback, useEffect, useRef, useState } from "react";
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
import { CaretDownIcon, XIcon } from "../shared/icons";
import { operatorConfig } from "./filter-icons";
import type { SearchOperator } from "./filter-types";

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
    <Flex
      align="center"
      className={cn("relative", className)}
      style={width ? { width: typeof width === "number" ? `${width}px` : width } : undefined}
    >
      {/* Field selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="absolute left-0 z-10 inline-flex h-8 items-center gap-0.5 rounded-l-md border-r bg-muted/50 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {activeField?.label}
            <CaretDownIcon className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {fields.map((f) => (
            <DropdownMenuItem
              key={f.field}
              onClick={() => handleFieldChange(f.field)}
              className={cn(f.field === selectedField && "bg-accent")}
            >
              {f.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Operator selector */}
      {activeField && activeField.operators.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-20 z-10 inline-flex h-8 w-10 items-center justify-center gap-0.5 border-r text-muted-foreground hover:text-foreground"
              aria-label={t("filter.selectOperator")}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {activeField.operators.map((op) => {
              const meta = operatorConfig[op];
              return (
                <DropdownMenuItem
                  key={op}
                  onClick={() => onOperatorChange(op)}
                  className={cn(op === operator && "bg-accent")}
                >
                  <meta.icon className="mr-2 h-3.5 w-3.5" />
                  {t(meta.labelKey)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : activeField ? (
        <span className="absolute left-20 inline-flex h-8 w-10 items-center justify-center border-r text-muted-foreground">
          <currentOp.icon className="h-3.5 w-3.5" />
        </span>
      ) : null}

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={activeField?.label}
        className="h-8 pl-32 pr-8 text-sm"
        aria-label={activeField?.label}
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
