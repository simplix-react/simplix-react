/**
 * What happened when a value was offered to the clipboard.
 *
 * <p>`"unsupported"` is separated from `"failed"` because only one of them is the user's to act
 * on: a browser that has no clipboard to write to will never have one at this address, and
 * telling the reader to try again sends them round a loop that cannot end.
 */
export type CopyOutcome = "copied" | "unsupported" | "failed";

/**
 * Puts a value on the clipboard, by whichever route this page actually has.
 *
 * <p>`navigator.clipboard` only exists in a secure context. A console reached over plain HTTP at
 * a LAN address — which is how an on-premises deployment is normally reached from the next desk —
 * has no `navigator.clipboard` at all, so touching `.writeText` on it throws
 * `Cannot read properties of undefined`, and every copy control on every screen answers a click
 * with an unexplained error. The older selection-based route still works there, so it is tried
 * before giving up.
 *
 * <p>Never throws. The caller gets an outcome and decides what to say about it, because the one
 * thing a copy control must not do is leave the click unanswered.
 *
 * @param value the text to place on the clipboard
 * @returns which route succeeded, or why none did
 */
export async function copyText(value: string): Promise<CopyOutcome> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return "copied";
    } catch {
      // Permission refused, or a document the browser does not consider focused. The selection
      // route below is not bound by either, so it is still worth trying.
    }
  }

  return copyBySelection(value);
}

/**
 * The route that predates the clipboard API, and the only one a plain-HTTP page has.
 *
 * @param value the text to place on the clipboard
 * @returns whether the document accepted the copy
 */
function copyBySelection(value: string): CopyOutcome {
  if (typeof document === "undefined") {
    return "unsupported";
  }

  const carrier = document.createElement("textarea");
  carrier.value = value;
  // Off-screen rather than hidden: a field the browser considers invisible cannot hold a
  // selection, and a selection is the whole mechanism here.
  carrier.setAttribute("readonly", "");
  carrier.style.position = "fixed";
  carrier.style.top = "-9999px";
  carrier.style.opacity = "0";
  document.body.appendChild(carrier);

  try {
    carrier.select();
    carrier.setSelectionRange(0, value.length);
    return document.execCommand("copy") ? "copied" : "unsupported";
  } catch {
    return "failed";
  } finally {
    document.body.removeChild(carrier);
  }
}
