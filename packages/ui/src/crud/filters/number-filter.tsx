import { useCallback, useEffect, useState } from "react";
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
import { CaretDownIcon, HashIcon, XIcon } from "../shared/icons";
import { operatorConfig } from "./filter-icons";
import type { SearchOperator } from "./filter-types";

export interface NumberFilterProps {
  label?: string;
  value: number | undefined;
  operator: SearchOperator;
  onChange: (value: number | undefined) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
  placeholder?: string;
  className?: string;
}

export function NumberFilter({
  label,
  value,
  operator,
  onChange,
  onOperatorChange,
  operators,
  defaultOperator,
  placeholder,
  className,
}: NumberFilterProps) {
  const { t } = useTranslation("simplix/ui");
  const [inputValue, setInputValue] = useState(value !== undefined ? String(value) : "");
  const currentOp = operatorConfig[operator];

  // Sync from external reset (e.g., clear all filters)
  useEffect(() => {
    const expected = value !== undefined ? String(value) : "";
    if (expected !== inputValue) {
      setInputValue(expected);
    }
  }, [value]); // inputValue intentionally excluded to avoid loops

  const handleInputChange = useCallback(
    (raw: string) => {
      setInputValue(raw);
      if (raw === "") {
        onChange(undefined);
      } else {
        const num = Number(raw);
        if (!Number.isNaN(num)) {
          onChange(num);
        }
      }
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange(undefined);
    if (defaultOperator && operator !== defaultOperator) {
      onOperatorChange(defaultOperator);
    }
  }, [onChange, onOperatorChange, operator, defaultOperator]);

  return (
    <Flex align="center" className={cn("relative", className)}>
      {operators.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-0 z-10 inline-flex h-8 items-center gap-0.5 rounded-l-md border-r bg-muted/50 px-2 text-muted-foreground hover:text-foreground"
              aria-label={t("filter.selectOperator")}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {operators.map((op) => {
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
      ) : (
        <span className="absolute left-2.5 text-muted-foreground">
          <HashIcon className="h-4 w-4" />
        </span>
      )}
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder ?? label ?? t("filter.numberPlaceholder")}
        className={cn(
          "h-8 pr-8 text-sm",
          operators.length > 1 ? "pl-14" : "pl-8",
        )}
        aria-label={label ?? t("filter.numberFilter")}
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
