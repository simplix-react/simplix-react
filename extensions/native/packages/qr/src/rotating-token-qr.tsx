import { Button, Skeleton, Text } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { QrCodeView } from "./qr-code-view";

/** A short-lived token issued for on-site presence proof. */
export interface RotatingToken {
  /** Value to encode (typically a URL embedding the presence token). */
  value: string;
  /** Seconds this token stays valid after issuance. */
  expiresInSeconds: number;
}

/** Props for the {@link RotatingTokenQr} component. */
export interface RotatingTokenQrProps {
  /**
   * Issues a fresh token. Called on mount and then every `rotateMs`;
   * issuance stops while unmounted (tokens are only minted while displayed).
   */
  fetchToken: () => Promise<RotatingToken>;
  /** Re-issue interval. Defaults to `10000` (10 s rotation). */
  rotateMs?: number;
  /** QR edge length. Defaults to `240`. */
  size?: number;
  /** Called when issuance keeps failing (network loss) — after each failed try. */
  onError?: (error: unknown) => void;
  className?: string;
}

/**
 * Rotating presence-token QR: re-issues the token on an interval, shows the
 * remaining validity of the current token, and offers retry when issuance
 * fails. Rotation minimizes remote relay and reuse of a captured frame.
 */
export function RotatingTokenQr({
  fetchToken,
  rotateMs = 10_000,
  size = 240,
  onError,
  className,
}: RotatingTokenQrProps) {
  const { t } = useTranslation("simplix/native-qr");
  const [token, setToken] = useState<RotatingToken | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const mountedRef = useRef(true);

  const issue = useCallback(async () => {
    try {
      const next = await fetchToken();
      if (!mountedRef.current) return;
      setToken(next);
      setRemaining(next.expiresInSeconds);
      setFailed(false);
    } catch (error) {
      if (!mountedRef.current) return;
      setFailed(true);
      onError?.(error);
    }
  }, [fetchToken, onError]);

  // Rotation loop — only while mounted (i.e. only while the QR is displayed).
  useEffect(() => {
    mountedRef.current = true;
    void issue();
    const rotation = setInterval(() => void issue(), rotateMs);
    return () => {
      mountedRef.current = false;
      clearInterval(rotation);
    };
  }, [issue, rotateMs]);

  // Remaining-validity countdown for the CURRENT token.
  useEffect(() => {
    if (remaining === null) return;
    const tick = setInterval(() => {
      setRemaining((current) => (current === null || current <= 0 ? current : current - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [remaining !== null]);

  if (failed && !token) {
    return (
      <View className={className}>
        <View className="items-center gap-3 py-8">
          <Text size="sm" tone="muted">
            {t("issueFailed")}
          </Text>
          <Button variant="outline" size="sm" onPress={() => void issue()}>
            {t("retry")}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={className}>
      <View className="items-center gap-3">
        {token ? (
          <QrCodeView value={token.value} size={size} />
        ) : (
          <Skeleton style={{ width: size, height: size }} />
        )}
        {remaining !== null ? (
          <Text size="sm" tone={remaining <= 3 ? "destructive" : "muted"}>
            {t("validFor", { seconds: Math.max(remaining, 0) })}
          </Text>
        ) : null}
        {failed && token ? (
          <Text size="caption" tone="destructive">
            {t("refreshFailed")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
