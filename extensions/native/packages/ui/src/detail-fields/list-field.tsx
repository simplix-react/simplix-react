import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "../primitives/text";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link ListField}. */
export interface ListFieldProps extends CommonDetailFieldProps {
  items?: Array<string | ReactNode> | null;
}

/** Read-only bulleted list of values. */
export function ListField({ items, ...rest }: ListFieldProps) {
  return (
    <DetailField {...rest}>
      {items && items.length > 0 ? (
        <View className="gap-1">
          {items.map((item, index) => (
            <View key={index} className="flex-row items-start gap-2">
              <Text size="sm" tone="muted">
                •
              </Text>
              {typeof item === "string" || typeof item === "number" ? (
                <Text size="base" className="flex-1">
                  {item}
                </Text>
              ) : (
                <View className="flex-1">{item}</View>
              )}
            </View>
          ))}
        </View>
      ) : null}
    </DetailField>
  );
}
