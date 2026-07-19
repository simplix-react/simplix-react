import { formatBytes } from "@simplix-react/headless";
import { useTranslation } from "@simplix-react/i18n/react";
import * as DocumentPicker from "expo-document-picker";
import { View } from "react-native";

import { Button } from "../controls/button";
import { Text } from "../primitives/text";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Locally picked document (upload is the app's responsibility). */
export interface PickedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string | null;
}

/** Props for the {@link FileField} form component. */
export interface FileFieldProps extends CommonFieldProps {
  value: PickedFile | null;
  onChange: (value: PickedFile | null) => void;
  /** Accepted MIME types (e.g. `["application/pdf"]`). Defaults to all. */
  mimeTypes?: string[];
}

/**
 * Document picker field (expo-document-picker). The value is the local
 * document; uploading it to an attachment endpoint is the app's
 * responsibility.
 */
export function FileField({
  value,
  onChange,
  mimeTypes,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: FileFieldProps) {
  const { t } = useTranslation("simplix/native");

  const chooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: mimeTypes,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? undefined,
        mimeType: asset.mimeType ?? null,
      });
    }
  };

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      className={className}
    >
      {value ? (
        <View className="gap-2">
          <View className="flex-row items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5">
            <Text size="sm" numberOfLines={1} className="flex-1">
              {value.name}
            </Text>
            {value.size !== undefined ? (
              <Text size="caption" tone="muted">
                {formatBytes(value.size)}
              </Text>
            ) : null}
          </View>
          <Button variant="outline" disabled={disabled} onPress={() => onChange(null)}>
            {t("field.removeFile")}
          </Button>
        </View>
      ) : (
        <Button variant="outline" disabled={disabled} onPress={chooseFile}>
          {t("field.chooseFile")}
        </Button>
      )}
    </FieldWrapper>
  );
}
