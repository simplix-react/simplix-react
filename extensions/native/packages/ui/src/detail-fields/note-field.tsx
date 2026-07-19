import { View } from "react-native";

import { Text } from "../primitives/text";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link NoteField}. */
export interface NoteFieldProps extends CommonDetailFieldProps {
  value?: string | null;
}

/** Read-only multi-line note block on a soft surface. */
export function NoteField({ value, ...rest }: NoteFieldProps) {
  return (
    <DetailField {...rest}>
      {value ? (
        <View className="rounded-md border border-border bg-surface-2 px-3 py-2.5">
          <Text size="sm">{value}</Text>
        </View>
      ) : null}
    </DetailField>
  );
}
