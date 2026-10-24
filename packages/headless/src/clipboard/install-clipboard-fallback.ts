import { copyText } from "./copy-text";

/**
 * Gives a page with no Clipboard API one that works.
 *
 * @remarks
 * ISSUE #22. `navigator.clipboard` exists only in a secure context. `localhost` and `127.0.0.1`
 * count as one; `http://` at a LAN address does not — which is how an on-premises console is
 * normally reached from the next desk. `@simplix-react/ui` reaches for
 * `navigator.clipboard.writeText` with nothing around it in two components, so at that address
 * the call throws inside the framework's own click handler, reaches nobody, and every copy
 * control answers a click by doing nothing at all.
 *
 * @remarks
 * This fills a gap rather than replacing anything: the property is installed ONLY where the
 * browser left it undefined, so a page that has the real API keeps it untouched. That is the
 * same shape as this file's neighbour, the `crypto.randomUUID` fill, which exists here for the
 * same reason and in the same contexts.
 *
 * @remarks
 * The write goes through {@link copyText}'s selection route, which needs the click that provoked
 * it — browsers only honour it while a user gesture is being handled. Every caller of this is
 * such a handler, so that holds; a copy started from a timer would not, and would report failure
 * rather than copy silently.
 *
 * @remarks
 * Rejects when the value could not be placed, the way the real API rejects when permission is
 * refused. A caller that awaits without catching therefore stays as quiet as it was before —
 * this restores the copying, not the reporting. Controls built in this repository report it
 * themselves through `useCopyToClipboard`.
 *
 * @remarks
 * REVERT WHEN FIXED: when `@simplix-react/ui` copies through a route that works outside a secure
 * context, delete this file and its call in each app's `polyfills.ts`. Confirm on a plain-HTTP
 * LAN address that a copy control still puts its value on the clipboard.
 *
 * @returns whether a fill was installed, which is false on a page that already had the API
 */
export function installClipboardFallback(): boolean {
  if (typeof navigator === "undefined" || typeof document === "undefined") {
    return false;
  }
  // The DOM types declare `navigator.clipboard` as always present, which is exactly the
  // assumption this file exists to correct — outside a secure context the property is missing.
  // Widening it back to optional is what lets the check ask the question the types refuse to.
  const existing = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
  if (typeof existing?.writeText === "function") {
    return false;
  }

  const writeText = async (value: string): Promise<void> => {
    const outcome = await copyText(value);
    if (outcome !== "copied") {
      throw new Error(`The clipboard is not writable from this page (${outcome})`);
    }
  };

  // Assigned rather than spread onto an existing object: outside a secure context there is no
  // `navigator.clipboard` at all to add a method to.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    enumerable: false,
    value: { writeText } as Clipboard,
  });

  return true;
}
