import { useCallback } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Input } from "../../base/input";
import { Flex } from "../../primitives/flex";
import { cn } from "../../utils/cn";
import { MagnifyingGlassIcon, XIcon } from "../shared/icons";

export interface TextFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextFilter({ label, value, onChange, placeholder, className }: TextFilterProps) {
  const { t } = useTranslation("simplix/ui");
  const handleClear = useCallback(() => onChange(""), [onChange]);

  return (
    <Flex align="center" className={cn("relative", className)}>
      <MagnifyingGlassIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="h-8 pl-8 pr-8 text-sm"
        aria-label={label}
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
