import type { TranslationValues } from "../types.js";

/**
 * One figure as its own language says it — 「31대」, 「31」, 「31台」.
 *
 * @remarks
 * <b>The counter word travels with the number rather than beside it.</b> A tile handed a separate
 * unit needs that unit to exist in every language, and English has none for a machine or a case.
 * An entry left empty there does not render as nothing: the adapter is configured not to return
 * empty strings, so the key falls through to the fallback language and an English console reads
 * 「31대」. One counted string per language has no empty entry to fall back from.
 *
 * @remarks
 * <b>Absent stays absent.</b> A figure nobody counted answers `undefined` so the tile draws its own
 * em-dash rather than 「0대」, which is a claim somebody counted and found none.
 *
 * @remarks
 * <b>The separator travels with the counter word, so the counted string carries the format.</b>
 * `figure` is handed over as a number and stays one — that is what the `_one` / `_other` plural
 * selection reads, so pre-formatting it here would separate the digits and silently break the
 * plural in every language that has one. The grouping belongs in the catalogue instead, as
 * `{{count, number}}`, which i18next runs through `Intl.NumberFormat` for the resolved language:
 * 「1,358건」 in Korean, `1,358 duties` in English, 「1,358件」 in Japanese. A counted string written
 * `{{count}}건` draws 「1358건」 and is a defect, not a variant — `counted-string-without-number-format`
 * in the frontend audit fails on it.
 *
 * @param t the translator for the catalogue holding the counted string
 * @param figure the count, or `undefined` when nothing counted it
 * @param key the counted string — `{{count, number}}대` · `{{count, number}}` · `{{count, number}}台`
 * @returns the figure as words, or `undefined`
 */
export function countedFigure(
  t: (key: string, values?: TranslationValues) => string,
  figure: number | undefined,
  key: string,
): string | undefined {
  return figure === undefined ? undefined : t(key, { count: figure });
}
