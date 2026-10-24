import { getHttpStatus } from "./error-utils.js";

/**
 * Whether a read failed because the record is not there.
 *
 * <p><b>「없다」 and 「못 읽었다」 are different answers and a screen that gives one for the other
 * sends the reader the wrong way.</b> Told a wording is missing when the read merely failed, they
 * go off and write one that is already there; told the read failed when the key genuinely has no
 * wording, they go looking for a fault in a console that is working. `query.isError` alone cannot
 * separate them — the server can, and does: a record that is not there answers 404 with its own
 * sentence, and everything else is the read failing.
 *
 * @param error whatever the query handed back
 * @returns whether the server said the record is not there
 */
export function recordIsAbsent(error: unknown): boolean {
  return getHttpStatus(error) === 404;
}

/**
 * Whether a read failed because the record is outside the reader's granted range.
 *
 * <p><b>「범위 밖이다」 and 「없다」 are different answers too, and the server separates them.</b> A
 * record this account may not read answers 403; one that is not there answers 404. `query.isError`
 * conflates the two, and a screen that says 「부여받은 범위 밖입니다」 to a mistyped identifier sends
 * the reader to ask for a range they do not need — which is the same confusion, told with more
 * confidence.
 *
 * @param error whatever the query handed back
 * @returns whether the server refused the read rather than finding nothing
 */
export function recordIsOutOfScope(error: unknown): boolean {
  return getHttpStatus(error) === 403;
}
