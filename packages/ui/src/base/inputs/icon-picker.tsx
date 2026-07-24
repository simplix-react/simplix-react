import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale } from "@simplix-react/i18n/react";
import { XIcon } from "../../crud/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../overlay/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../overlay/tooltip";
import { Skeleton } from "../display/skeleton";
import { cn } from "../../utils/cn";
import type { LucideProps, LucideIcon } from "lucide-react";
// Type-only imports on purpose: the dynamic icon registry and the icon catalog
// are heavy payloads, so their runtime values are loaded lazily (see
// DynamicIconLazy and useIconsData) and must never be statically imported here.
import type { IconName } from "lucide-react/dynamic";
import { DynamicIconLazy } from "../display/dynamic-icon-lazy";
import type { IconData } from "./icon-picker/icons-data";
import {
  getIconPickerLocale,
  getCategoryName,
  interpolate,
  type IconPickerLocale,
} from "./icon-picker/locales";

export type { IconData };

/** Props for the {@link Icon} sub-component. */
export interface IconProps extends Omit<LucideProps, "ref"> {
  /** Lucide icon name in kebab-case (e.g. "folder", "user-circle"). */
  name: IconName;
}

/** Props for the {@link IconPicker} component. */
export interface IconPickerProps
  extends Omit<
    ComponentPropsWithoutRef<typeof PopoverTrigger>,
    "onSelect" | "onOpenChange" | "onChange"
  > {
  /**
   * Currently selected icon name (kebab-case). When provided the component
   * is fully controlled; omit for uncontrolled use.
   */
  value?: IconName;

  /** Called when the user selects or clears an icon. Clear emits `""`. */
  onChange?: (value: string) => void;

  /** Control the open state of the popover externally. */
  open?: boolean;

  /** Initial open state (Radix pass-through). */
  defaultOpen?: boolean;

  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** Placeholder text shown in the default trigger when no icon is selected. */
  triggerPlaceholder?: string;

  /**
   * Custom icon list to display. When omitted the built-in icons-data is used.
   * Each entry must conform to `IconData`.
   */
  iconsList?: IconData[];

  /**
   * Show the category sidebar.
   * @defaultValue true
   */
  categorized?: boolean;

  /** Open the popover in a modal (Radix Popover `modal` prop). */
  modal?: boolean;

  /**
   * BCP-47 language code for the picker UI (e.g. `"ko"`, `"en"`, `"ja"`).
   * When omitted, follows the active i18n locale from {@link useLocale} (re-renders
   * on locale change). Bundled languages: ko/en/ja — unknown codes fall back to English.
   */
  lang?: string;
}

const IconRenderer = memo(({ name }: { name: IconName }) => {
  return <Icon name={name} />;
});
IconRenderer.displayName = "IconRenderer";

const IconsColumnSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <div className="grid w-full grid-cols-6 gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton key={i} className="size-9 rounded-md" />
        ))}
      </div>
    </div>
  );
};

const useIconsData = () => {
  const [icons, setIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadIcons = async () => {
      setIsLoading(true);

      const [{ iconsData }, { dynamicIconImports }] = await Promise.all([
        import("./icon-picker/icons-data"),
        import("lucide-react/dynamic"),
      ]);
      if (isMounted) {
        setIcons(
          iconsData.filter((icon: IconData) => {
            return icon.name in dynamicIconImports;
          })
        );
        setIsLoading(false);
      }
    };

    loadIcons();

    return () => {
      isMounted = false;
    };
  }, []);

  const { categories, categoryCounts } = useMemo(() => {
    const categorySet = new Set<string>();
    const counts: Record<string, number> = {};
    icons.forEach((icon) => {
      icon.categories.forEach((cat: string) => {
        categorySet.add(cat);
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return {
      categories: Array.from(categorySet).sort(),
      categoryCounts: counts,
    };
  }, [icons]);

  return { icons, categories, categoryCounts, isLoading };
};

const IconPicker = forwardRef<
  ComponentRef<typeof PopoverTrigger>,
  IconPickerProps
>(
  (
    {
      value,
      onChange,
      open,
      defaultOpen,
      onOpenChange,
      children,
      triggerPlaceholder,
      iconsList,
      categorized = true,
      modal = false,
      lang,
      ...props
    },
    ref
  ) => {
    const activeLocale = useLocale();
    const locale = useMemo<IconPickerLocale>(() => {
      return getIconPickerLocale(lang ?? activeLocale);
    }, [lang, activeLocale]);

    const [selectedIcon, setSelectedIcon] = useState<IconName | undefined>(
      undefined
    );
    const [isOpen, setIsOpen] = useState(defaultOpen || false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
      null
    );
    const {
      icons,
      categories,
      categoryCounts,
      isLoading: isLoadingIcons,
    } = useIconsData();

    const iconsToUse = useMemo(() => iconsList || icons, [iconsList, icons]);

    const randomIcons = useMemo(() => {
      const shuffled = [...iconsToUse].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 100);
    }, [iconsToUse]);

    const filteredIcons = useMemo(() => {
      if (selectedCategory) {
        return iconsToUse.filter((icon) =>
          icon.categories.includes(selectedCategory)
        );
      }
      return randomIcons;
    }, [selectedCategory, iconsToUse, randomIcons]);

    const handleValueChange = useCallback(
      (icon: IconName) => {
        if (value === undefined) {
          setSelectedIcon(icon);
        }
        onChange?.(icon);
      },
      [value, onChange]
    );

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        setSelectedCategory(null);
        if (open === undefined) {
          setIsOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [open, onOpenChange]
    );

    const handleIconClick = useCallback(
      (iconName: IconName) => {
        handleValueChange(iconName);
        setIsOpen(false);
        setSelectedCategory(null);
      },
      [handleValueChange]
    );

    const handleCategoryClick = useCallback((category: string) => {
      setSelectedCategory((prev) => (prev === category ? null : category));
    }, []);

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setSelectedIcon(undefined);
      }
      onChange?.("");
    }, [value, onChange]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.scrollTop += e.deltaY;
    }, []);

    const statusText = useMemo(() => {
      if (selectedCategory) {
        return interpolate(locale.iconsInCategory, {
          count: filteredIcons.length,
          category: getCategoryName(locale, selectedCategory),
        });
      }
      return interpolate(locale.iconsCount, { count: filteredIcons.length });
    }, [filteredIcons.length, selectedCategory, locale]);

    return (
      <Popover
        open={open ?? isOpen}
        onOpenChange={handleOpenChange}
        modal={modal}
      >
        <PopoverTrigger ref={ref} asChild {...props}>
          {children || (
            <button
              type="button"
              className={cn(
                "flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {value || selectedIcon ? (
                <>
                  <Icon name={(value || selectedIcon)!} />
                  {value || selectedIcon}
                </>
              ) : (
                triggerPlaceholder || locale.triggerPlaceholder
              )}
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[560px] max-w-[calc(100vw-32px)] p-3">
          <div className="flex gap-3">
            {/* Category List - Left Side */}
            {categorized && (
              <div
                className="h-80 w-36 shrink-0 overflow-y-auto overflow-x-hidden border-r pr-2"
                onWheel={handleWheel}
              >
                <div className="space-y-0.5">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      !selectedCategory
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span>{locale.randomIcons}</span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px]">
                      100
                    </span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedCategory === category
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground"
                      )}
                      onClick={() => handleCategoryClick(category)}
                      title={getCategoryName(locale, category)}
                    >
                      <span className="truncate">
                        {getCategoryName(locale, category)}
                      </span>
                      <span className="ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-muted px-1.5 text-[10px]">
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Icons Grid - Right Side */}
            <div
              className="h-80 flex-1 overflow-y-auto overflow-x-hidden"
              onWheel={handleWheel}
            >
              {isLoadingIcons ? (
                <IconsColumnSkeleton />
              ) : filteredIcons.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {locale.noIconsFound}
                </div>
              ) : (
                <TooltipProvider delayDuration={300}>
                  <div className="grid grid-cols-6 gap-1">
                    {filteredIcons.map((icon) => (
                      <Tooltip key={icon.name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex size-9 items-center justify-center rounded-md border transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                              (value || selectedIcon) === icon.name &&
                                "border-primary bg-primary/10"
                            )}
                            onClick={() =>
                              handleIconClick(icon.name as IconName)
                            }
                          >
                            <IconRenderer name={icon.name as IconName} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">{icon.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {!selectedCategory ? locale.selectCategory : statusText}
            </span>
            {(value || selectedIcon) && (
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={handleClear}
              >
                <XIcon className="size-3 mr-1" />
                {locale.clear}
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
IconPicker.displayName = "IconPicker";

const Icon = forwardRef<ComponentRef<LucideIcon>, IconProps>(
  ({ name, ...props }, ref) => {
    return <DynamicIconLazy name={name} {...props} ref={ref} />;
  }
);
Icon.displayName = "Icon";

export { IconPicker, Icon };
export type { IconName };
