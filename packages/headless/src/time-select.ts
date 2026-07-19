/**
 * Pure helpers for time selection UIs (12/24-hour conversion, wrapping,
 * and min/max range checks at hour/minute granularity).
 */

/** Convert a 24-hour value (0-23) to a 12-hour clock value with meridiem. */
export function to12Hour(hour24: number): { hour12: number; pm: boolean } {
  const pm = hour24 >= 12;
  const h = hour24 % 12;
  return { hour12: h === 0 ? 12 : h, pm };
}

/** Convert a 12-hour clock value (1-12) with meridiem to a 24-hour value (0-23). */
export function to24Hour(hour12: number, pm: boolean): number {
  const base = hour12 % 12;
  return pm ? base + 12 : base;
}

/** Wrap a value into [min, max], cycling past either bound. */
export function wrapValue(value: number, min: number, max: number): number {
  if (value > max) return min;
  if (value < min) return max;
  return value;
}

/** Return a copy of `date` with the given hours/minutes and zeroed seconds. */
export function withTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** True when no minute within the given hour of `base` falls inside [minDate, maxDate]. */
export function isHourDisabled(
  base: Date,
  hour24: number,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const start = withTime(base, hour24, 0);
  const end = new Date(start);
  end.setMinutes(59, 59, 999);
  if (minDate && end < minDate) return true;
  if (maxDate && start > maxDate) return true;
  return false;
}

/** True when the given hour:minute of `base` falls outside [minDate, maxDate]. */
export function isMinuteDisabled(
  base: Date,
  hour24: number,
  minute: number,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const start = withTime(base, hour24, minute);
  const end = new Date(start);
  end.setSeconds(59, 999);
  if (minDate && end < minDate) return true;
  if (maxDate && start > maxDate) return true;
  return false;
}

/** Clamp a date into [minDate, maxDate]. */
export function clampToRange(date: Date, minDate?: Date, maxDate?: Date): Date {
  if (minDate && date < minDate) return new Date(minDate);
  if (maxDate && date > maxDate) return new Date(maxDate);
  return date;
}

/** Pad a time unit to two digits ("7" → "07"). */
export function padTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

/** A time of day without a date. */
export interface TimeValue {
  /** Hours in 24-hour form (0-23). */
  hours: number;
  /** Minutes (0-59). */
  minutes: number;
}

function toMinutesOfDay(time: TimeValue): number {
  return time.hours * 60 + time.minutes;
}

/** True when no minute within the given hour falls inside [minTime, maxTime]. */
export function isHourOutOfRange(
  hour24: number,
  minTime?: TimeValue,
  maxTime?: TimeValue,
): boolean {
  if (minTime && hour24 * 60 + 59 < toMinutesOfDay(minTime)) return true;
  if (maxTime && hour24 * 60 > toMinutesOfDay(maxTime)) return true;
  return false;
}

/** True when the given hour:minute falls outside [minTime, maxTime]. */
export function isMinuteOutOfRange(
  hour24: number,
  minute: number,
  minTime?: TimeValue,
  maxTime?: TimeValue,
): boolean {
  const t = hour24 * 60 + minute;
  if (minTime && t < toMinutesOfDay(minTime)) return true;
  if (maxTime && t > toMinutesOfDay(maxTime)) return true;
  return false;
}

/** Clamp a time of day into [minTime, maxTime]. */
export function clampTimeValue(
  time: TimeValue,
  minTime?: TimeValue,
  maxTime?: TimeValue,
): TimeValue {
  if (minTime && toMinutesOfDay(time) < toMinutesOfDay(minTime)) return { ...minTime };
  if (maxTime && toMinutesOfDay(time) > toMinutesOfDay(maxTime)) return { ...maxTime };
  return time;
}
