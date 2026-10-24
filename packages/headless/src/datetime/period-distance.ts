import { daysUntilDay } from "./days-until";

/** What a period is, relative to the deployment's today. */
export type PeriodStanding =
  | { readonly kind: "startsIn"; readonly days: number }
  | { readonly kind: "startsToday" }
  | { readonly kind: "daysLeft"; readonly days: number }
  | { readonly kind: "endsToday" }
  | { readonly kind: "ended" }
  | { readonly kind: "unknown" };

/**
 * Where a period stands from today, which is what decides what it is called.
 *
 * <p><b>기간은 오늘로부터의 거리로 그린다.</b> Whether a period is 예정, 진행 중 or 종료 is decided
 * by that distance, so a screen that draws only its two dates has drawn something that stops
 * agreeing with the status beside it after one day — and the reader has to do the subtraction to
 * find out which of the three they are looking at.
 *
 * <p><b>The dates stay.</b> The distance is what the reader judges by and the dates are what they
 * check against; a screen showing only 「6일 남음」 cannot be compared with anything.
 *
 * @param startOn the first day, as a calendar date
 * @param endOn the last day, as a calendar date
 * @returns where the period stands, or `unknown` when neither date is known
 */
export function periodStanding(
  startOn: string | null | undefined,
  endOn: string | null | undefined,
): PeriodStanding {
  const toStart = daysUntilDay(startOn);
  if (toStart !== null && toStart > 0) {
    return { kind: "startsIn", days: toStart };
  }
  if (toStart === 0) {
    return { kind: "startsToday" };
  }
  const toEnd = daysUntilDay(endOn);
  if (toEnd === null) {
    return { kind: "unknown" };
  }
  if (toEnd < 0) {
    return { kind: "ended" };
  }
  return toEnd === 0 ? { kind: "endsToday" } : { kind: "daysLeft", days: toEnd };
}
