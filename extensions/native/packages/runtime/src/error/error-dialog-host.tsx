import { Button, Dialog, Text } from "@simplix-react-native/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { clearError, useErrorEvent } from "./error-store";

/**
 * Global error dialog fed by {@link dispatchError}. Leads with the server's
 * concrete message; the error code renders as secondary detail. Mounted by
 * `SimplixNativeProvider`.
 */
export function ErrorDialogHost() {
  const { t } = useTranslation("simplix/native");
  const event = useErrorEvent();

  return (
    <Dialog
      open={event !== null}
      onOpenChange={(open) => {
        if (!open) clearError();
      }}
      title={t("error.title")}
      description={event?.message}
      footer={
        <Button onPress={clearError}>{t("common.confirm")}</Button>
      }
    >
      {event?.errorCode ? (
        <Text size="caption" tone="muted">
          {`${t("error.codeLabel")}: ${event.errorCode}`}
        </Text>
      ) : null}
    </Dialog>
  );
}
