import { decodeCalendarDate, serializeCalendarDate } from "@simplix-react/headless";
import { useTranslation } from "@simplix-react/i18n/react";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../controls/button";
import { StatusBadge } from "../controls/status-badge";
import type { StatusTone } from "../controls/status-tone";
import { Input } from "../inputs/input";
import { NativeDateTimePicker } from "../inputs/native-date-time-picker";
import { Switch } from "../inputs/switch";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import type { EntityFilterDef, FacetedFilterDef } from "./filter-defs";
import { SwipeableRow, type SwipeAction } from "./swipeable-row";
import type { UseEntityFeedResult } from "./use-entity-feed";

// ── Standard card row ──

/** Props for the standard {@link EntityRow} card row. */
export interface EntityRowProps {
  /** Primary line. */
  title: string;
  /** Secondary line. */
  subtitle?: string;
  /** Trailing status badge. */
  status?: { tone: StatusTone; label: string };
  /** Leading visual (avatar, icon). */
  leading?: ReactNode;
  /** Custom trailing content (overrides `status`). */
  trailing?: ReactNode;
  /** Muted meta line under the subtitle (timestamps, counts). */
  meta?: string;
  onPress?: () => void;
  className?: string;
}

/** Standard card row: leading visual, title/subtitle/meta, trailing status. */
export function EntityRow({
  title,
  subtitle,
  status,
  leading,
  trailing,
  meta,
  onPress,
  className,
}: EntityRowProps) {
  const content = (
    <View
      className={cn(
        "min-h-16 flex-row items-center gap-3 border-b border-border bg-card px-4 py-3",
        className,
      )}
    >
      {leading}
      <View className="flex-1 gap-0.5">
        <Text size="base" className="font-medium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text size="sm" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text size="caption" tone="muted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ?? (status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : null)}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
      {content}
    </Pressable>
  );
}

// ── Filter sheet ──

function FacetedOptions({
  def,
  draft,
  setDraft,
}: {
  def: FacetedFilterDef;
  draft: Record<string, unknown>;
  setDraft: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
}) {
  const current = draft[def.key];
  const selectedValues: string[] = def.multiple
    ? Array.isArray(current)
      ? (current as string[])
      : []
    : current != null && current !== ""
      ? [String(current)]
      : [];

  const toggleValue = (value: string) => {
    setDraft((prev) => {
      if (def.multiple) {
        const list = Array.isArray(prev[def.key]) ? ([...(prev[def.key] as string[])]) : [];
        const next = list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value];
        return { ...prev, [def.key]: next.length > 0 ? next : undefined };
      }
      return { ...prev, [def.key]: prev[def.key] === value ? undefined : value };
    });
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {def.options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => toggleValue(option.value)}
            className={cn(
              "min-h-9 items-center justify-center rounded-full border px-3.5 py-1.5",
              selected ? "border-primary bg-primary-soft" : "border-border bg-background",
            )}
          >
            <Text
              size="sm"
              className={cn(selected ? "font-semibold text-primary" : "text-foreground")}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FilterSheet({
  open,
  onClose,
  defs,
  values,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  defs: EntityFilterDef[];
  values: Record<string, unknown>;
  onApply: (values: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation("simplix/native");
  const [draft, setDraftState] = useState<Record<string, unknown>>(values);

  const setDraft = (
    updater: (prev: Record<string, unknown>) => Record<string, unknown>,
  ) => setDraftState(updater);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("filter.title")}
    >
      <ScrollView keyboardShouldPersistTaps="handled" className="px-4">
        <View className="gap-5 py-3">
          {defs.map((def, index) => {
            if (def.type === "toggle") {
              return (
                <View key={index} className="flex-row items-center justify-between">
                  <Text size="sm" className="font-medium">
                    {def.label}
                  </Text>
                  <Switch
                    checked={draft[def.key] === true}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({ ...prev, [def.key]: checked ? true : undefined }))
                    }
                  />
                </View>
              );
            }
            if (def.type === "text") {
              return (
                <View key={index} className="gap-1.5">
                  <Text size="sm" className="font-medium">
                    {def.label}
                  </Text>
                  <Input
                    value={(draft[def.key] as string | undefined) ?? ""}
                    onChangeText={(text) =>
                      setDraft((prev) => ({ ...prev, [def.key]: text || undefined }))
                    }
                    placeholder={def.placeholder}
                  />
                </View>
              );
            }
            if (def.type === "date-range") {
              return (
                <View key={index} className="gap-1.5">
                  <Text size="sm" className="font-medium">
                    {def.label}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <NativeDateTimePicker
                        value={decodeCalendarDate(draft[def.fromKey] as string | undefined) ?? null}
                        onChange={(date) =>
                          setDraft((prev) => ({
                            ...prev,
                            [def.fromKey]: serializeCalendarDate(date),
                          }))
                        }
                        mode="date"
                      />
                    </View>
                    <Text tone="muted">–</Text>
                    <View className="flex-1">
                      <NativeDateTimePicker
                        value={decodeCalendarDate(draft[def.toKey] as string | undefined) ?? null}
                        onChange={(date) =>
                          setDraft((prev) => ({
                            ...prev,
                            [def.toKey]: serializeCalendarDate(date),
                          }))
                        }
                        mode="date"
                      />
                    </View>
                  </View>
                </View>
              );
            }
            return (
              <View key={index} className="gap-1.5">
                <Text size="sm" className="font-medium">
                  {def.label}
                </Text>
                <FacetedOptions def={def} draft={draft} setDraft={setDraft} />
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex-row gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" className="flex-1" onPress={() => setDraftState({})}>
          {t("filter.reset")}
        </Button>
        <Button
          className="flex-1"
          onPress={() => {
            onApply(draft);
            onClose();
          }}
        >
          {t("filter.apply")}
        </Button>
      </View>
    </BottomSheet>
  );
}

// ── Active filter chips ──

function summarizeFilter(
  def: EntityFilterDef,
  values: Record<string, unknown>,
): string | null {
  if (def.type === "date-range") {
    const from = values[def.fromKey] as string | undefined;
    const to = values[def.toKey] as string | undefined;
    if (!from && !to) return null;
    return `${def.label}: ${from ?? ""}–${to ?? ""}`;
  }
  const value = values[def.key];
  if (value === undefined || value === null || value === "") return null;
  if (def.type === "toggle") return def.label;
  if (def.type === "text") return `${def.label}: ${String(value)}`;
  const options = def.options;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (value.length === 1) {
      const match = options.find((o) => o.value === value[0]);
      return `${def.label}: ${match?.label ?? String(value[0])}`;
    }
    return `${def.label}: ${value.length}`;
  }
  const match = options.find((o) => o.value === value);
  return `${def.label}: ${match?.label ?? String(value)}`;
}

function clearFilterKeys(
  def: EntityFilterDef,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...values };
  if (def.type === "date-range") {
    delete next[def.fromKey];
    delete next[def.toKey];
  } else {
    delete next[def.key];
  }
  return next;
}

// ── EntityList ──

/** Props for the {@link EntityList} component. */
export interface EntityListProps<T> {
  /** Feed state from `useEntityFeed`. */
  feed: UseEntityFeedResult<T>;
  /** Row renderer — compose `EntityList.Row` for the standard card row. */
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  /** Filter sheet definitions; empty hides the filter button. */
  filters?: EntityFilterDef[];
  searchPlaceholder?: string;
  /** Hide the pinned search bar row. */
  hideSearch?: boolean;
  /** Swipe-left actions per row. */
  itemActions?: (item: T, index: number) => SwipeAction[];
  /** Floating create action. */
  onCreate?: () => void;
  createLabel?: string;
  /** Content above the list (category tabs, summary strip). */
  header?: ReactNode;
  /** Show the total count line. Defaults to `true`. */
  showTotal?: boolean;
  className?: string;
}

/**
 * The mobile list grammar: card rows in an infinite-scroll feed with a pinned
 * search bar, a filter sheet with applied chips, pull-to-refresh, swipe row
 * actions, and a floating create button.
 *
 * State comes from {@link UseEntityFeedResult} (`useEntityFeed`) — EntityList
 * renders it. There is no `CrudList` on native; screens with growing row
 * counts always start from the backend paged searchable endpoint and this
 * component (generate with `simplix scaffold <entity> --native`).
 */
export function EntityList<T>({
  feed,
  renderItem,
  keyExtractor,
  filters = [],
  searchPlaceholder,
  hideSearch,
  itemActions,
  onCreate,
  createLabel,
  header,
  showTotal = true,
  className,
}: EntityListProps<T>) {
  const { t } = useTranslation("simplix/native");
  const insets = useSafeAreaInsets();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const chips = filters
    .map((def) => ({ def, summary: summarizeFilter(def, feed.filters.values) }))
    .filter((entry): entry is { def: EntityFilterDef; summary: string } =>
      Boolean(entry.summary),
    );

  const emptyContent = () => {
    if (feed.isLoading) {
      return (
        <View className="items-center py-16">
          <ActivityIndicator />
        </View>
      );
    }
    const reason = feed.emptyReason;
    if (!reason) return null;
    const message =
      reason === "error"
        ? t("list.error")
        : reason === "no-search"
          ? t("list.noSearch")
          : reason === "no-filter"
            ? t("list.noFilter")
            : t("list.noData");
    return (
      <View className="items-center gap-3 py-16">
        <Text size="sm" tone="muted">
          {message}
        </Text>
        {reason === "error" ? (
          <Button variant="outline" size="sm" onPress={feed.refresh}>
            {t("common.retry")}
          </Button>
        ) : null}
      </View>
    );
  };

  return (
    <View className={cn("flex-1 bg-background", className)}>
      {header}
      {!hideSearch || filters.length > 0 ? (
        <View className="gap-2 border-b border-border px-4 pb-3 pt-2">
          <View className="flex-row items-center gap-2">
            {!hideSearch ? (
              <View className="flex-1">
                <Input
                  value={feed.search}
                  onChangeText={feed.setSearch}
                  placeholder={searchPlaceholder ?? t("list.searchPlaceholder")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
            ) : null}
            {filters.length > 0 ? (
              <Button
                variant="outline"
                onPress={() => setFilterSheetOpen(true)}
              >
                {feed.filters.activeCount > 0
                  ? `${t("filter.title")} ${feed.filters.activeCount}`
                  : t("filter.title")}
              </Button>
            ) : null}
          </View>
          {chips.length > 0 ? (
            <View className="flex-row flex-wrap items-center gap-1.5">
              {chips.map(({ def, summary }, index) => (
                <Pressable
                  key={index}
                  accessibilityRole="button"
                  onPress={() =>
                    feed.filters.setValues(clearFilterKeys(def, feed.filters.values))
                  }
                  className="flex-row items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1"
                >
                  <Text size="caption" className="font-medium text-primary">
                    {summary}
                  </Text>
                  <Text size="caption" className="text-primary">
                    ✕
                  </Text>
                </Pressable>
              ))}
              <Pressable accessibilityRole="button" onPress={feed.filters.clear}>
                <Text size="caption" tone="muted" className="px-1.5 underline">
                  {t("filter.clear")}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {showTotal && feed.total !== undefined ? (
            <Text size="caption" tone="muted">
              {t("list.totalCount", { count: feed.total })}
            </Text>
          ) : null}
        </View>
      ) : null}

      <FlatList
        data={feed.items}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => {
          const actions = itemActions?.(item, index) ?? [];
          const row = renderItem(item, index);
          return actions.length > 0 ? (
            <SwipeableRow actions={actions}>{row}</SwipeableRow>
          ) : (
            <>{row}</>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={feed.isRefreshing} onRefresh={feed.refresh} />
        }
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={emptyContent}
        ListFooterComponent={
          feed.isLoadingMore ? (
            <View className="items-center py-4">
              <ActivityIndicator />
            </View>
          ) : feed.items.length > 0 && !feed.hasMore ? (
            <View className="items-center py-4">
              <Text size="caption" tone="muted">
                {t("list.endOfList")}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + (onCreate ? 88 : 16) }}
      />

      {onCreate ? (
        <View
          className="absolute right-4"
          style={{ bottom: insets.bottom + 16 }}
        >
          <Button size="lg" className="rounded-full px-5 shadow-lg" onPress={onCreate}>
            {`+ ${createLabel ?? t("list.create")}`}
          </Button>
        </View>
      ) : null}

      <FilterSheet
        key={filterSheetOpen ? "open" : "closed"}
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        defs={filters}
        values={feed.filters.values}
        onApply={feed.filters.setValues}
      />
    </View>
  );
}

EntityList.Row = EntityRow;
