import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { useTranslation } from "@simplix-react/i18n/react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  languageChevronStyle,
  languageDotStyle,
  languageItemStyle,
  languageNameStyle,
  languageSegmentStyle,
  languageSegmentsStyle,
  languageSelectorStyle,
  languageStepStyle,
  languageTriggerStyle,
} from "./language-selector.style";


/**
 * Where an i18n field draws its language selector.
 *
 * - `label` - beside the field's label, above the control.
 * - `inset` - inside the control: at the inline end of an input, vertically centred, and in the
 *   bottom inline-end corner of a textarea.
 */
export type LanguageSelectorPlacement = "label" | "inset";

export interface LanguageSelectorProps {
  languages: LocaleConfig[];
  value: LocaleCode;
  onChange: (language: LocaleCode) => void;
  filledLanguages?: LocaleCode[];
  disabled?: boolean;
  /** Where the selector is drawn, which picks its look; see {@link LanguageSelectorPlacement}. */
  placement?: LanguageSelectorPlacement;
  className?: string;
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
      aria-hidden="true"
      {...slotAttributes(languageChevronStyle, {})}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
      aria-hidden="true"
      {...slotAttributes(languageChevronStyle, {})}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function LanguageSelector({
  languages,
  value,
  onChange,
  filledLanguages = [],
  disabled,
  placement = "label",
  className,
}: LanguageSelectorProps) {
  const { Select, SelectTrigger, SelectContent, SelectItem } =
    useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");

  if (languages.length <= 1) return null;

  const rawIndex = languages.findIndex((lang) => lang.code === value);
  const currentIndex = rawIndex === -1 ? 0 : rawIndex;
  const currentLanguage = languages[currentIndex];
  const isFilled = (code: LocaleCode) => filledLanguages.includes(code);
  const isCurrentFilled = isFilled(value);

  const handlePrev = () => {
    const prevIndex =
      currentIndex <= 0 ? languages.length - 1 : currentIndex - 1;
    onChange(languages[prevIndex].code);
  };
  const handleNext = () => {
    const nextIndex =
      currentIndex >= languages.length - 1 ? 0 : currentIndex + 1;
    onChange(languages[nextIndex].code);
  };

  return (
    <div
      className={cn("flex flex-col overflow-hidden", className)}
      {...slotAttributes(languageSelectorStyle, { placement })}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={disabled}
          aria-label={t("field.previousLanguage")}
          className="flex h-4 w-4 items-center justify-center"
          {...slotAttributes(languageStepStyle, { side: "prev" })}
        >
          <ChevronLeftIcon />
        </button>

        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            aria-label={t("field.selectLanguage")}
            className="!h-auto !min-h-0 w-20 [&>svg]:hidden justify-center"
            {...partAttributes(languageTriggerStyle, {})}
          >
            <span
              className="flex items-center"
              {...slotAttributes(languageNameStyle, { spacing: "tight" })}
            >
              <span
                className="size-1.5"
                {...slotAttributes(languageDotStyle, { filled: isCurrentFilled })}
              />
              {currentLanguage.name}
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            {languages.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                {...partAttributes(languageItemStyle, {})}
              >
                <span
                  className="flex items-center"
                  {...slotAttributes(languageNameStyle, { spacing: "wide" })}
                >
                  <span
                    className="size-1.5"
                    {...slotAttributes(languageDotStyle, { filled: isFilled(lang.code) })}
                  />
                  {lang.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={handleNext}
          disabled={disabled}
          aria-label={t("field.nextLanguage")}
          className="flex h-4 w-4 items-center justify-center"
          {...slotAttributes(languageStepStyle, { side: "next" })}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div
        className="flex items-center overflow-hidden"
        {...slotAttributes(languageSegmentsStyle, {})}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            disabled={disabled}
            aria-label={t("field.switchToLanguage", { language: lang.name })}
            className="h-1 flex-1"
            {...slotAttributes(languageSegmentStyle, {
              filled: isFilled(lang.code),
              current: lang.code === value,
            })}
          />
        ))}
      </div>
    </div>
  );
}
