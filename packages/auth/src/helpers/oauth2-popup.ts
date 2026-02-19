export interface OAuth2PopupOptions {
  /** Full URL to open in the popup (e.g., authorization endpoint). */
  url: string;
  /** Popup window width. Defaults to `500`. */
  width?: number;
  /** Popup window height. Defaults to `600`. */
  height?: number;
  /** Timeout in milliseconds. Defaults to `120000` (2 minutes). */
  timeoutMs?: number;
  /** Expected origin of the postMessage from the popup callback page. */
  expectedOrigin: string;
}

export type OAuth2PopupResult =
  | { type: "success"; data: unknown }
  | { type: "cancelled" }
  | { type: "timeout" }
  | { type: "error"; message: string };

/**
 * Opens an OAuth2 authorization flow in a popup window and waits for
 * the result via `postMessage`.
 *
 * The popup callback page must call `window.opener.postMessage(data, origin)`.
 */
export function openOAuth2Popup(
  options: OAuth2PopupOptions,
): Promise<OAuth2PopupResult> {
  const {
    url,
    width = 500,
    height = 600,
    timeoutMs = 120_000,
    expectedOrigin,
  } = options;

  return new Promise<OAuth2PopupResult>((resolve) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},popup=yes`;

    const maybeWin = window.open(url, "oauth2_popup", features);
    if (!maybeWin) {
      resolve({ type: "error", message: "Popup blocked by browser" });
      return;
    }
    const win: Window = maybeWin;

    let resolved = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      resolved = true;
      window.removeEventListener("message", onMessage);
      if (pollTimer !== null) clearInterval(pollTimer);
      if (timeoutTimer !== null) clearTimeout(timeoutTimer);
    }

    function onMessage(event: MessageEvent) {
      if (resolved) return;
      if (event.origin !== expectedOrigin) return;

      cleanup();
      if (!win.closed) win.close();
      resolve({ type: "success", data: event.data });
    }

    window.addEventListener("message", onMessage);

    // Poll for manual close (user closed the popup)
    pollTimer = setInterval(() => {
      if (resolved) return;
      if (win.closed) {
        cleanup();
        resolve({ type: "cancelled" });
      }
    }, 500);

    timeoutTimer = setTimeout(() => {
      if (resolved) return;
      cleanup();
      if (!win.closed) win.close();
      resolve({ type: "timeout" });
    }, timeoutMs);
  });
}
