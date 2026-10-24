/** How many bytes each step of the ladder holds, largest first, with the name each step takes. */
const LADDER: readonly (readonly [number, string])[] = [
  [1024 ** 3, "GB"],
  [1024 ** 2, "MB"],
  [1024, "KB"],
  [1, "B"],
];

/**
 * How large a file is, in the largest unit that does not round it away.
 *
 * <p><b>Clamping to one megabyte is what this exists to stop.</b> Two screens wrote
 * `Math.max(1, Math.round(bytes / 1048576)) + "MB"`, which draws 「1MB」 for everything under a
 * megabyte and a half — so a preview said 「예상 크기 1MB · 첨부 포함 시 1MB」 while the field above
 * it promised that attachments make a file four times larger. Both figures were right to the byte
 * and the screen said the multiplier does not exist.
 *
 * <p><b>The unit is not translated and is not meant to be.</b> `MB` reads as `MB` in every language
 * this console ships, and the board writes 「96MB」 rather than a word — so this is a formatter
 * rather than a catalogue entry, and it takes no translator.
 *
 * <p>The framework has this function (`formatBytes` in `@simplix-react/headless`), and
 * `@simplix-react/ui` re-exports it from a file its own barrel does not carry — so no screen in
 * this repository can import it. Written here until that barrel does.
 *
 * @param bytes how large it is
 * @returns the size with its unit, or an empty string where nothing measured it
 */
export function byteSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return "";
  }
  for (const [step, unit] of LADDER) {
    if (bytes >= step) {
      return `${Math.round(bytes / step)}${unit}`;
    }
  }
  return "0B";
}
