/**
 * What a generated hook actually answers with, said once instead of at every call site.
 *
 * <p>Every domain package here is generated from a `simplix-boot` spec, so its hooks run on the
 * envelope-unwrapping mutator and React Query's `data` <b>is</b> the plain DTO at run time. Orval
 * types the same hook from its fetcher's signature — `{ data: <the envelope>, status }` — which
 * describes a response nothing in this application ever sees. The two disagree, and the
 * disagreement is in the generated code, which is regenerated from the server and must not be
 * hand-edited.
 *
 * <p>So the reconciliation lives here, in one named place with the reason attached, rather than as
 * a cast in every screen. A cast per screen is the same unchecked step taken twenty times with
 * nothing saying why, and the twenty-first is written by somebody who reads it as noise.
 *
 * <p><b>Never reach for `data.body` after this.</b> The mutator already took the envelope off; the
 * field is `undefined`, and a screen that reads it renders empty with nothing failing.
 */

/**
 * Reads a generated hook's answer as the DTO it is at run time.
 *
 * @typeParam T the DTO the endpoint returns
 * @param data what the hook handed back
 * @returns that DTO, or undefined before the read has answered
 */
export function bootBody<T>(data: unknown): T | undefined {
  return (data ?? undefined) as T | undefined;
}

/** One page of a paged list, as Spring Data shapes it. */
export interface BootPage<T> {
  readonly content: readonly T[];
  readonly totalElements?: number;
  readonly totalPages?: number;
  readonly number?: number;
  readonly size?: number;
}

/**
 * Reads a generated list hook's answer as the page it is at run time.
 *
 * @typeParam T the row type
 * @param data what the hook handed back
 * @returns the page, with an empty `content` before the read has answered — so a caller never has
 *          to tell "still loading" apart from "no rows" just to map over them
 */
export function bootPage<T>(data: unknown): BootPage<T> {
  const page = (data ?? undefined) as BootPage<T> | undefined;
  return page?.content ? page : { content: [] };
}

/**
 * The sentence the server sent with a refusal or a failure.
 *
 * <p><b>Why a screen needs it.</b> A read refused for being outside the reader's range and a read
 * that failed because the server is down both arrive as an error, and a screen that draws one
 * message for both tells a 관리감독자 to 「잠시 뒤에 다시 시도하세요」 about a workplace they will
 * never be allowed to open. The server already names the rule — 「부여받은 범위 밖의 기록입니다」 —
 * and that sentence is the only thing on hand that separates the two.
 *
 * @param error whatever the query threw
 * @returns the server's own sentence, or undefined when it sent none
 */
export function serverMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { message } = error as { message?: unknown };
  return typeof message === "string" && message.length > 0 ? message : undefined;
}
