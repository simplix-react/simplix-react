import { useCallback } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Flex } from "../../primitives/flex";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { MagnifyingGlassIcon, XIcon } from "../shared/icons";

/**
 * Props for the {@link TextFilter} component.
 */
export interface TextFilterProps {
  /** Label used for accessibility `aria-label` and as fallback placeholder. */
  label: string;
  /** Current filter value. */
  value: string;
  /** Called when the user types or clears the filter. */
  onChange: (value: string) => void;
  /** Placeholder text (defaults to `label`). */
  placeholder?: string;
  className?: string;
}

/**
 * Text input filter with search icon and clear button.
 *
 * ```
 * ┌──────────────────────────┐
 * │ [Q] Search pets...   [X] │
 * └──────────────────────────┘
 * ```
 *
 * @param props - {@link TextFilterProps}
 */
export function TextFilter({ label, value, onChange, placeholder, className }: TextFilterProps) {
  const { Input } = useFlatUIComponents();
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
