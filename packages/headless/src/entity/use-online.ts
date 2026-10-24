import { useEffect, useState } from "react";

/**
 * Whether the browser currently has a connection.
 *
 * <p><b>Read once and then followed.</b> `navigator.onLine` is a value at a moment, and a screen
 * that reads it on mount alone goes on saying 「오프라인」 after the connection is back — so the
 * two events the platform fires are what keep it current.
 *
 * <p><b>True where the platform cannot say.</b> A renderer without `navigator` — a test, a server
 * render — is not evidence of being offline, and answering `false` there would block writing on a
 * screen nobody could unblock.
 *
 * @returns true while the browser believes it is connected
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const going = () => setOnline(navigator.onLine);
    window.addEventListener("online", going);
    window.addEventListener("offline", going);
    going();
    return () => {
      window.removeEventListener("online", going);
      window.removeEventListener("offline", going);
    };
  }, []);

  return online;
}
