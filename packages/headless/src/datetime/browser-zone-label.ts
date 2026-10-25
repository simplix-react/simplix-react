/**
 * What to call the zone a customer-facing time is drawn in.
 *
 * <p>Customer screens draw an instant in the reader's own zone: a "last seen" or a payment
 * deadline in the seller's zone is a time the reader has to convert before it means anything.
 * The cost of that choice is that the same moment reads differently to the customer and to the
 * operator looking at the same record, and neither screen says why. Naming the zone beside the
 * time is what closes that: the customer can see their own time is theirs, and a support call
 * about a date has something to point at.
 *
 * <p>Not for operator screens. Those draw in the deployment's zone by construction, and every
 * operator reading them shares it.
 */

/**
 * The short name this runtime gives the browser's own zone, in the reader's language.
 *
 * <p>Taken from the platform rather than from a table of abbreviations: what is short and
 * unambiguous differs by zone and by language: `EDT` in New York, `UTC+9` in Seoul, where no
 * short abbreviation exists in the reader's locale. A hand-kept table would be wrong for
 * whichever zone nobody thought of.
 *
 * @param at the instant being labelled; the answer differs across a daylight-saving boundary,
 *        so the label belongs to the moment rather than to the zone
 * @returns the zone's short name, or an empty string when this runtime will not name it
 */
export function browserZoneLabel(at: Date): string {
  const named = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName");
  return named ? offsetAsUtc(named.value) : "";
}

/**
 * A bare offset the platform writes against Greenwich (`GMT+9`, `GMT-03:30`) as the same offset
 * against UTC (`UTC+9`), which is how offsets are written on screens and in settings. A named
 * abbreviation (`KST`, `EDT`, `GMT` for London in winter) is left as it is.
 */
export function offsetAsUtc(label: string): string {
  return /^GMT[+-]\d{1,2}(?::\d{2})?$/.test(label) ? `UTC${label.slice(3)}` : label;
}

/**
 * The short name of a named zone, in the reader's language.
 *
 * <p>The workplace's zone rather than the browser's. Every date, deadline and 「오늘」 on a console
 * screen is read in the workplace's zone (design 8.6), and the operator reading it is often not in
 * that zone, as a supervisor in Seoul is looking at a site in Hai Phong. Naming it in the status strip
 * is what stops a deadline being read eight hours out.
 *
 * <p>Taken from the platform for the same reason {@link browserZoneLabel} is: what is short and
 * unambiguous differs by zone and by language, and a hand-kept table is wrong for whichever zone
 * nobody thought of.
 *
 * @param timeZone the IANA identifier, e.g. `Asia/Seoul`
 * @param at the instant being labelled; the answer differs across a daylight-saving boundary
 * @returns the zone's short name, or the identifier itself when this runtime will not name it
 */
export function zoneLabel(timeZone: string, at: Date): string {
  try {
    const named = new Intl.DateTimeFormat(undefined, { timeZone, timeZoneName: "short" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName");
    return named ? offsetAsUtc(named.value) : timeZone;
  } catch (error) {
    // An identifier this runtime does not know. Showing it raw beats showing nothing: it is still
    // the zone the server named, and a reader can look it up.
    if (error instanceof RangeError) return timeZone;
    throw error;
  }
}

/**
 * Writes a time with the zone it is drawn in.
 *
 * @param text the time as it has already been written
 * @param at the instant it came from
 * @returns the time followed by its zone in brackets, or the time alone when the runtime will
 *          not name the zone
 */
export function withBrowserZone(text: string, at: Date): string {
  const label = browserZoneLabel(at);
  return label ? `${text} (${label})` : text;
}
