import { useTranslation } from "@simplix-react/i18n/react";
import * as ImagePicker from "expo-image-picker";
import { Image, View } from "react-native";

import { Button } from "../controls/button";
import { addToast } from "@simplix-react/headless";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Locally picked image asset (upload is the app's responsibility). */
export interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
}

/** Props for the {@link ImageField} form component. */
export interface ImageFieldProps extends CommonFieldProps {
  value: PickedImage | null;
  onChange: (value: PickedImage | null) => void;
  /** Enable the camera capture source. Defaults to `true`. */
  camera?: boolean;
  /** Enable the photo library source. Defaults to `true`. */
  library?: boolean;
  /** JPEG quality 0..1 forwarded to the picker. */
  quality?: number;
  /** Preview aspect ratio (width / height). Defaults to `4 / 3`. */
  aspectRatio?: number;
}

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage {
  return {
    uri: asset.uri,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Image field with camera and photo-library sources (expo-image-picker).
 * The value is the local asset; uploading it to an attachment endpoint is the
 * app's responsibility.
 */
export function ImageField({
  value,
  onChange,
  camera = true,
  library = true,
  quality = 0.8,
  aspectRatio = 4 / 3,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: ImageFieldProps) {
  const { t } = useTranslation("simplix/native");

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      addToast({ type: "warning", message: t("field.cameraPermissionDenied") });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(toPickedImage(result.assets[0]));
    }
  };

  const chooseFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality,
    });
    if (!result.canceled && result.assets[0]) {
      onChange(toPickedImage(result.assets[0]));
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
          <Image
            source={{ uri: value.uri }}
            accessibilityIgnoresInvertColors
            className="w-full rounded-md border border-border"
            style={{ aspectRatio }}
            resizeMode="cover"
          />
          <View className="flex-row gap-2">
            {camera ? (
              <Button variant="outline" className="flex-1" disabled={disabled} onPress={takePhoto}>
                {t("field.takePhoto")}
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="flex-1"
              disabled={disabled}
              onPress={() => onChange(null)}
            >
              {t("field.removeImage")}
            </Button>
          </View>
        </View>
      ) : (
        <View className="flex-row gap-2">
          {camera ? (
            <Button variant="outline" className="flex-1" disabled={disabled} onPress={takePhoto}>
              {t("field.takePhoto")}
            </Button>
          ) : null}
          {library ? (
            <Button
              variant="outline"
              className="flex-1"
              disabled={disabled}
              onPress={chooseFromLibrary}
            >
              {t("field.chooseFromLibrary")}
            </Button>
          ) : null}
        </View>
      )}
    </FieldWrapper>
  );
}
