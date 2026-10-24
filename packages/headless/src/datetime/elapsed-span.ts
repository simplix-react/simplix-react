/** How many milliseconds make a second. */
const MILLIS_IN_SECOND = 1000;

/** How many seconds make a minute. */
const SECONDS_IN_MINUTE = 60;

/** How many minutes make an hour. */
const MINUTES_IN_HOUR = 60;

/** How many hours make a day. */
const HOURS_IN_DAY = 24;

/** The units a length of time is said in, smallest first. */
export type ElapsedUnit = "seconds" | "minutes" | "hours" | "days";

/** How far down the ladder each unit sits, so a floor can be compared against a rung. */
const RUNG: Readonly<Record<ElapsedUnit, number>> = {
  seconds: 0,
  minutes: 1,
  hours: 2,
  days: 3,
};

/** The ladder from the top down, which is the order a length is offered its units in. */
const LADDER: readonly ElapsedUnit[] = ["days", "hours", "minutes", "seconds"];

/** A length of time, reduced to the largest unit that fits it and the next one down. */
export interface ElapsedSpan {
  /** The largest unit the length fills. */
  readonly unit: ElapsedUnit;
  /** How many of that unit. */
  readonly count: number;
  /** How many of the unit below, and zero at the bottom of the ladder. */
  readonly rest: number;
}

/**
 * A length of time, reduced to the way a person says it out loud.
 *
 * <p><b>The reduction is the whole point, and its absence is silent.</b> A screen that divides by
 * sixty once says 「2180분 14초」 for a run that took a day and a half — the arithmetic is right,
 * the sentence is unreadable, and nothing anywhere reports a fault. It only shows up when
 * something actually runs long, which is the day the figure most needs reading.
 *
 * <p><b>The words stay with the caller.</b> This module holds no catalogue, and a run's 「4분 0초」
 * and a wait's 「4분」 are two sentences about the same span — so what comes back is the shape, and
 * the screen that owns the sentence writes it. {@link periodStanding} splits the same way.
 *
 * @param millis how long it took
 * @param floor the smallest unit worth saying — a wait is never said in seconds, so the screen
 *   that shows one passes `"minutes"` and gets `0분` rather than `47초`
 * @param ceiling the largest unit worth saying — a shift is read against the hour marks beside it,
 *   so the screen drawing one passes `"hours"` and gets `24시간` rather than `1일`
 * @returns the span, or undefined where the length is not a number or runs backwards
 */
export function elapsedSpan(
  millis: number,
  floor: ElapsedUnit = "seconds",
  ceiling: ElapsedUnit = "days",
): ElapsedSpan | undefined {
  if (!Number.isFinite(millis) || millis < 0) {
    return undefined;
  }
  // Truncated rather than rounded: 「얼마나 지났는가」 is the whole units that have gone by, so a
  // wait of 59.6 seconds is 59 seconds and not a minute.
  const seconds = Math.floor(millis / MILLIS_IN_SECOND);
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const days = Math.floor(hours / HOURS_IN_DAY);

  const rung: Readonly<Record<ElapsedUnit, ElapsedSpan>> = {
    days: { unit: "days", count: days, rest: hours % HOURS_IN_DAY },
    hours: { unit: "hours", count: hours, rest: minutes % MINUTES_IN_HOUR },
    minutes: { unit: "minutes", count: minutes, rest: seconds % SECONDS_IN_MINUTE },
    seconds: { unit: "seconds", count: seconds, rest: 0 },
  };
  for (const unit of LADDER) {
    if (RUNG[unit] > RUNG[ceiling]) continue;
    if (RUNG[unit] < RUNG[floor]) break;
    if (rung[unit].count > 0 || RUNG[unit] === RUNG[floor]) return rung[unit];
  }
  return rung[floor];
}

/** How many milliseconds each rung of the ladder holds. */
const MILLIS_IN: Readonly<Record<ElapsedUnit, number>> = {
  seconds: MILLIS_IN_SECOND,
  minutes: MILLIS_IN_SECOND * SECONDS_IN_MINUTE,
  hours: MILLIS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR,
  days: MILLIS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY,
};

/**
 * {@link elapsedSpan} for a length already counted in a unit.
 *
 * <p><b>For the lengths that were never two instants.</b> A shift is stored as minutes and a
 * silence window as hours — neither has a start, and a screen holding one had to write the
 * conversion out before it could reduce it. Written out, the conversion lands in the screen and
 * the next rung up lands there with it.
 *
 * @param value how many of `unit` it lasts
 * @param unit which unit that is
 * @param floor the smallest unit worth saying
 * @param ceiling the largest unit worth saying
 * @returns the span, or undefined where the value is not a number or runs backwards
 */
export function elapsedSpanOf(
  value: number,
  unit: ElapsedUnit,
  floor: ElapsedUnit = "seconds",
  ceiling: ElapsedUnit = "days",
): ElapsedSpan | undefined {
  return elapsedSpan(value * MILLIS_IN[unit], floor, ceiling);
}

/**
 * {@link elapsedSpan} between two instants, as they arrive from the server.
 *
 * @param from when it began
 * @param to when it stopped moving — a caller measuring against now passes
 *   `new Date().toISOString()`
 * @param floor the smallest unit worth saying
 * @param ceiling the largest unit worth saying
 * @returns the span, or undefined where either instant is missing or unreadable
 */
export function elapsedSpanBetween(
  from: string | null | undefined,
  to: string | null | undefined,
  floor: ElapsedUnit = "seconds",
  ceiling: ElapsedUnit = "days",
): ElapsedSpan | undefined {
  if (!from || !to) {
    return undefined;
  }
  const began = Date.parse(from);
  const ended = Date.parse(to);
  if (Number.isNaN(began) || Number.isNaN(ended)) {
    return undefined;
  }
  return elapsedSpan(ended - began, floor, ceiling);
}
