import NetInfo from "@react-native-community/netinfo";
import { Button, Heading, Text } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

/** Props for the {@link NetworkRecoveryGate}. */
export interface NetworkRecoveryGateProps {
  /**
   * Fires when connectivity returns after an outage. Unattended flows reset
   * to the standby screen here — cached in-progress state is riskier than a
   * restart.
   */
  onRecovered?: () => void;
  /**
   * Outage must persist this long before the overlay shows (avoids flashing
   * on brief transitions). Defaults to `3000`.
   */
  graceMs?: number;
  children: ReactNode;
}

/**
 * Full-screen network recovery overlay for unattended devices: watches
 * connectivity (NetInfo), covers the app during sustained outages, and
 * signals recovery so the app can reset to standby.
 */
export function NetworkRecoveryGate({
  onRecovered,
  graceMs = 3000,
  children,
}: NetworkRecoveryGateProps) {
  const { t } = useTranslation("simplix/native-kiosk");
  const [offline, setOffline] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);
  const onRecoveredRef = useRef(onRecovered);
  onRecoveredRef.current = onRecovered;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOffline = state.isConnected === false;
      setOffline(isOffline);
      if (isOffline) {
        wasOffline.current = true;
      } else if (wasOffline.current) {
        wasOffline.current = false;
        onRecoveredRef.current?.();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (offline) {
      graceTimer.current = setTimeout(() => setOverlayVisible(true), graceMs);
    } else {
      if (graceTimer.current) clearTimeout(graceTimer.current);
      setOverlayVisible(false);
    }
    return () => {
      if (graceTimer.current) clearTimeout(graceTimer.current);
    };
  }, [offline, graceMs]);

  return (
    <View className="flex-1">
      {children}
      {overlayVisible ? (
        <View className="absolute inset-0 items-center justify-center gap-4 bg-background p-8">
          <ActivityIndicator size="large" />
          <Heading level={3} className="text-center">
            {t("offlineTitle")}
          </Heading>
          <Text size="base" tone="muted" className="text-center">
            {t("offlineDescription")}
          </Text>
          <Button
            variant="outline"
            onPress={() => {
              void NetInfo.refresh();
            }}
          >
            {t("retry")}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
