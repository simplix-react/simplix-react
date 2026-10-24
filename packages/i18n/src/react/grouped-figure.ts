import { useCallback } from "react";
import { useLocale } from "./use-translation.js";

/**
 * A figure that reaches the screen without passing through a catalogue string, grouped.
 *
 * @remarks
 * <b>Almost every figure in this console is grouped by its own sentence.</b> A counted string
 * carries `{{count, number}}` and i18next runs the value through `Intl.NumberFormat` for the
 * resolved language, so 「1,358건」 needs nothing from the caller. This helper is for the few
 * places with no sentence to carry it — a tab's count, a cell that is a bare figure — where the
 * number is handed to a component as a number and rendered as it arrives.
 *
 * @remarks
 * <b>Ungrouped, the same quantity gets two spellings in one picture.</b> A tab head reading
 * 「수신 이력 3820」 sits directly above a pager reading 「3,820」, and a reader comparing them has
 * to work out whether they are the same number. That is the whole reason this exists.
 *
 * @remarks
 * <b>The reader's locale decides the separator, never a written-in one.</b>
 * `toLocaleString("ko-KR")` is Korean grouping in an English console; it happens to look right
 * while ko · en · ja all group on the comma, and stops looking right the moment a language that
 * does not is added. Taking the locale from {@link useLocale} is what makes this agree with the
 * catalogue path, which resolves the same way.
 *
 * @returns a formatter for one figure — `undefined` in, `undefined` out, so a caller that draws
 *          its own em-dash for an uncounted value keeps doing so
 */
export function useGroupedFigure(): (figure: number | undefined) => string | undefined {
  const locale = useLocale();
  return useCallback(
    (figure: number | undefined) => (figure === undefined ? undefined : figure.toLocaleString(locale)),
    [locale],
  );
}
