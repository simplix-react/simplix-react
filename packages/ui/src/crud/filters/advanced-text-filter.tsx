import { useCallback } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Flex } from "../../primitives/flex";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { CaretDownIcon, XIcon } from "../shared/icons";
import { operatorConfig } from "./filter-icons";
import type { SearchOperator } from "./filter-types";

export interface AdvancedTextFilterProps {
  label?: string;
  value: string;
  operator: SearchOperator;
  onChange: (value: string) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
  placeholder?: string;
  className?: string;
}

export function AdvancedTextFilter({
  label,
  value,
  operator,
  onChange,
  onOperatorChange,
  operators,
  defaultOperator,
  placeholder,
  className,
}: AdvancedTextFilterProps) {
  const { Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const currentOp = operatorConfig[operator];

  const handleOperatorChange = useCallback(
    (newOp: SearchOperator) => {
      onOperatorChange(newOp);
    },
    [onOperatorChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
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
                  onClick={() => handleOperatorChange(op)}
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
          <currentOp.icon className="h-4 w-4" />
        </span>
      )}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label ?? t(currentOp.labelKey)}
        className={cn(
          "h-8 pr-8 text-sm",
          operators.length > 1 ? "pl-14" : "pl-8",
        )}
        aria-label={label ?? t(currentOp.labelKey)}
      />
      {value && (
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
