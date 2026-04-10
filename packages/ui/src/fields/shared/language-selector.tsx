import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";

export interface LanguageSelectorProps {
  languages: LocaleConfig[];
  value: LocaleCode;
  onChange: (language: LocaleCode) => void;
  filledLanguages?: LocaleCode[];
  disabled?: boolean;
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
      className="size-3 text-muted-foreground"
      aria-hidden="true"
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
      className="size-3 text-muted-foreground"
      aria-hidden="true"
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
  className,
}: LanguageSelectorProps) {
  const { Select, SelectTrigger, SelectContent, SelectItem } =
    useFlatUIComponents();

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
      className={cn(
        "flex flex-col rounded-md border border-input bg-muted overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={disabled}
          aria-label="Previous language"
          className="flex h-4 w-4 items-center justify-center border-r border-input hover:bg-muted-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
        </button>

        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            aria-label="Select language"
            className="!h-auto !min-h-0 w-[80px] border-0 !bg-transparent dark:!bg-transparent !p-0 !py-0 text-[10px] leading-none shadow-none focus-visible:ring-0 [&>svg]:hidden justify-center [&>span]:leading-none"
          >
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isCurrentFilled ? "bg-green-500" : "bg-muted-foreground/30",
                )}
              />
              {currentLanguage.name}
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            {languages.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="text-xs"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isFilled(lang.code)
                        ? "bg-green-500"
                        : "bg-muted-foreground/30",
                    )}
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
          aria-label="Next language"
          className="flex h-4 w-4 items-center justify-center border-l border-input hover:bg-muted-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="flex items-center mx-1 mb-0.5 rounded-sm overflow-hidden">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            disabled={disabled}
            aria-label={`Switch to ${lang.name}`}
            className={cn(
              "h-1 flex-1 transition-colors disabled:cursor-not-allowed",
              isFilled(lang.code) ? "bg-green-500" : "bg-muted-foreground/30",
              lang.code === value && "ring-1 ring-inset ring-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
