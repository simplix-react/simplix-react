import { useTranslation } from "@simplix-react/i18n/react";
import { Pressable, View } from "react-native";

import { Button } from "../controls/button";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Menu entry for {@link ActionSheetMenu}. */
export interface ActionSheetItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

/** Props for the {@link ActionSheetMenu} component. */
export interface ActionSheetMenuProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}

/**
 * ActionSheet-style menu in a bottom sheet — the mobile replacement for
 * dropdown menus. Each item closes the sheet before running its action.
 */
export function ActionSheetMenu({ open, onClose, title, items }: ActionSheetMenuProps) {
  const { t } = useTranslation("simplix/native");

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <View>
        {items.map((item, index) => (
          <Pressable
            key={index}
            accessibilityRole="menuitem"
            disabled={item.disabled}
            onPress={() => {
              onClose();
              item.onPress();
            }}
            className={cn(
              "min-h-13 items-center justify-center border-b border-border py-3.5 active:bg-surface-2",
              item.disabled && "opacity-50",
            )}
          >
            <Text
              size="base"
              className={cn(item.destructive ? "text-destructive" : "text-foreground")}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="px-4 py-3">
        <Button variant="outline" onPress={onClose}>
          {t("common.cancel")}
        </Button>
      </View>
    </BottomSheet>
  );
}
