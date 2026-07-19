import type { QRCodeErrorCorrectionLevel } from "qrcode";
import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

/** Props for the {@link QrCodeView} component. */
export interface QrCodeViewProps {
  /** Encoded value. */
  value: string;
  /** Rendered edge length in density-independent pixels. Defaults to `240`. */
  size?: number;
  /** Quiet-zone margin in modules. Defaults to `2`. */
  quietZone?: number;
  /** Dark module color. Defaults to black. */
  color?: string;
  /** Background color. Defaults to white. */
  backgroundColor?: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  className?: string;
}

// Imported lazily below to keep the pure matrix module test-importable
// without react-native-svg.
import { buildQrMatrix, qrMatrixToPath } from "./qr-matrix";

/**
 * Static QR code rendered as SVG. Colors intentionally default to
 * black-on-white regardless of theme — scanner contrast beats brand tones.
 */
export function QrCodeView({
  value,
  size = 240,
  quietZone = 2,
  color = "#000000",
  backgroundColor = "#ffffff",
  errorCorrectionLevel = "M",
  className,
}: QrCodeViewProps) {
  const { path, viewBoxSize } = useMemo(() => {
    const matrix = buildQrMatrix(value, errorCorrectionLevel);
    return {
      path: qrMatrixToPath(matrix),
      viewBoxSize: matrix.size + quietZone * 2,
    };
  }, [value, errorCorrectionLevel, quietZone]);

  return (
    <View className={className} accessibilityLabel="QR code">
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        <Rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill={backgroundColor} />
        <Path d={path} fill={color} transform={`translate(${quietZone}, ${quietZone})`} />
      </Svg>
    </View>
  );
}
