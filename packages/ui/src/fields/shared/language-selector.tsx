import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { useTranslation } from "@simplix-react/i18n/react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  languageChevronStyle,
  languageDotStyle,
  languageFillBarStyle,
  languageFillStyle,
  languageInsetTriggerStyle,
  languageListStyle,
  languageMarkStyle,
  languageOptionStyle,
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
 * - `inset` - inside the control: the inline-end segment of an input, full height, or a column
 *   of the same width at the inline end of a textarea with one row per language. A fill bar
 *   segmented per language runs along the control's bottom edge.
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
  /**
   * The control the selector sits inside under `inset`: a select trigger for an input, a
   * vertical radio group for a textarea. Ignored under `label`.
   */
  control?: "input" | "textarea";
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
  control = "input",
  className,
}: LanguageSelectorProps) {
  if (placement === "inset") {
    return control === "textarea" ? (
      <LanguageRadioColumn
        languages={languages}
        value={value}
        onChange={onChange}
        filledLanguages={filledLanguages}
        disabled={disabled}
        className={className}
      />
    ) : (
      <LanguageSegment
        languages={languages}
        value={value}
        onChange={onChange}
        filledLanguages={filledLanguages}
        disabled={disabled}
        className={className}
      />
    );
  }
  return (
    <LanguageStepper
      languages={languages}
      value={value}
      onChange={onChange}
      filledLanguages={filledLanguages}
      disabled={disabled}
      className={className}
    />
  );
}

type InnerProps = Omit<LanguageSelectorProps, "placement" | "control">;

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...slotAttributes(languageMarkStyle, { shown: true })}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ shown }: { shown: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...slotAttributes(languageMarkStyle, { shown })}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Every language's name stacked in one grid cell with only the current one visible, so the box is
 * as wide as the widest name and never changes width or cuts a name off when the language changes.
 */
function NameStack({ languages, current }: { languages: LocaleConfig[]; current: LocaleCode }) {
  return (
    <span className="!grid flex-1 justify-items-start">
      {languages.map((lang) => (
        <span
          key={lang.code}
          aria-hidden={lang.code === current ? undefined : true}
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap",
            lang.code !== current && "invisible",
          )}
        >
          {lang.name}
        </span>
      ))}
    </span>
  );
}

/** The input's inline-end segment: a select whose trigger fills the segment. */
function LanguageSegment({ languages, value, onChange, filledLanguages = [], disabled, className }: InnerProps) {
  const { Select, SelectTrigger, SelectContent, SelectItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  if (languages.length <= 1) return null;
  const current = languages.find((lang) => lang.code === value) ?? languages[0];
  const isFilled = (code: LocaleCode) => filledLanguages.includes(code);

  return (
    <div
      className={cn("flex h-full", className)}
      {...slotAttributes(languageSelectorStyle, { placement: "inset" })}
    >
      <Select value={current.code} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          aria-label={t("field.selectLanguage")}
          className="flex items-center"
          {...partAttributes(languageInsetTriggerStyle, {})}
        >
          <span
            className="size-1.5 shrink-0"
            {...slotAttributes(languageDotStyle, { filled: isFilled(current.code) })}
          />
          <NameStack languages={languages} current={current.code} />
          <ChevronDownIcon />
        </SelectTrigger>
        <SelectContent align="end">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} {...partAttributes(languageItemStyle, {})}>
              <span className="flex items-center" {...slotAttributes(languageNameStyle, { spacing: "wide" })}>
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
    </div>
  );
}

/**
 * The textarea's inline-end column: a radio group with one row per language. Arrow keys move the
 * choice (Up / Down, and Left / Right in the writing direction), Home and End go to either end, and
 * only the current row is in the tab order.
 */
function LanguageRadioColumn({ languages, value, onChange, filledLanguages = [], disabled, className }: InnerProps) {
  const { t } = useTranslation("simplix/ui");
  const rowRefs = useRef(new Map<LocaleCode, HTMLButtonElement>());
  const rawIndex = languages.findIndex((lang) => lang.code === value);
  const currentIndex = rawIndex === -1 ? 0 : rawIndex;
  const currentCode = languages[currentIndex]?.code;

  // Keeps the current row in view when the choice moves past the column's visible rows.
  useEffect(() => {
    if (currentCode === undefined) return;
    rowRefs.current.get(currentCode)?.scrollIntoView?.({ block: "nearest" });
  }, [currentCode]);

  if (languages.length <= 1) return null;
  const isFilled = (code: LocaleCode) => filledLanguages.includes(code);

  const moveTo = (index: number) => {
    const count = languages.length;
    const next = languages[((index % count) + count) % count];
    onChange(next.code);
    rowRefs.current.get(next.code)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === "ArrowDown" || event.key === forward) moveTo(currentIndex + 1);
    else if (event.key === "ArrowUp" || event.key === backward) moveTo(currentIndex - 1);
    else if (event.key === "Home") moveTo(0);
    else if (event.key === "End") moveTo(languages.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className="h-full" {...slotAttributes(languageSelectorStyle, { placement: "inset" })}>
    <div
      role="radiogroup"
      aria-label={t("field.selectLanguage")}
      aria-orientation="vertical"
      aria-disabled={disabled || undefined}
      onKeyDown={disabled ? undefined : handleKeyDown}
      className={cn("flex flex-col", className)}
      {...slotAttributes(languageListStyle, {})}
    >
      {languages.map((lang, index) => {
        const current = index === currentIndex;
        return (
          <button
            key={lang.code}
            ref={(node) => {
              if (node) rowRefs.current.set(lang.code, node);
              else rowRefs.current.delete(lang.code);
            }}
            type="button"
            role="radio"
            aria-checked={current}
            tabIndex={current ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            className="flex shrink-0 items-center text-start"
            {...slotAttributes(languageOptionStyle, { current })}
          >
            <span
              className="size-1.5 shrink-0"
              {...slotAttributes(languageDotStyle, { filled: isFilled(lang.code) })}
            />
            <span className="flex-1 whitespace-nowrap">{lang.name}</span>
            <CheckIcon shown={current} />
          </button>
        );
      })}
    </div>
    </div>
  );
}

/**
 * The per-language fill indicator laid along the bottom of a control: one segment per language,
 * filled where that language has text, the current one at full strength. Decorative; the selector
 * carries the same state in its dots.
 */
export function LanguageFillBar({
  languages,
  value,
  filledLanguages = [],
}: Pick<LanguageSelectorProps, "languages" | "value" | "filledLanguages">) {
  if (languages.length <= 1) return null;
  return (
    <div aria-hidden="true" className="absolute flex" {...slotAttributes(languageFillBarStyle, {})}>
      {languages.map((lang) => (
        <span
          key={lang.code}
          className="h-full flex-1"
          {...slotAttributes(languageFillStyle, {
            filled: filledLanguages.includes(lang.code),
            current: lang.code === value,
          })}
        />
      ))}
    </div>
  );
}

/** The label row's selector: previous / next steps around a select, with the segment strip under it. */
function LanguageStepper({
  languages,
  value,
  onChange,
  filledLanguages = [],
  disabled,
  className,
}: InnerProps) {
  const placement = "label";
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
