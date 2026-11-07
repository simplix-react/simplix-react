/**
 * Contrast arithmetic and readers for the design tests: an `oklch()` token as linear sRGB, the WCAG
 * ratio of an ink over a ground, the blocks of a token file, and the declarations of a compiled rule.
 */
type Rgb = readonly [number, number, number];

/** An `oklch(L C H)` value as linear sRGB, clipped to the gamut. */
export function oklchToLinear(value: string): Rgb {
  const found = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value.trim());
  if (!found) throw new Error(`Not a plain oklch() colour: ${value}`);
  const [lightness, chroma, hue] = [Number(found[1]), Number(found[2]), (Number(found[3]) * Math.PI) / 180];
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (channel: number) => Math.min(1, Math.max(0, channel));
  return [
    clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** The ink at an opacity over a ground, blended the way a browser blends: in encoded sRGB. */
function over(ink: Rgb, ground: Rgb, opacity: number): Rgb {
  const mix = (i: number) => decode(opacity * encode(ink[i] ?? 0) + (1 - opacity) * encode(ground[i] ?? 0));
  return [mix(0), mix(1), mix(2)];
}

/** The WCAG contrast ratio of an ink drawn at an opacity over a ground. */
export function contrast(ink: string, ground: string, opacity = 1): number {
  const groundRgb = oklchToLinear(ground);
  const drawn = over(oklchToLinear(ink), groundRgb, opacity);
  const [light, dark] = [luminance(drawn), luminance(groundRgb)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

export interface Block {
  readonly head: string;
  readonly variables: ReadonlyMap<string, string>;
}

/** The blocks of a token file: the selector list and the custom properties each declares. */
export function tokenBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of css.replace(/\/\*[\s\S]*?\*\//g, "").split("}")) {
    const open = chunk.indexOf("{");
    if (open < 0) continue;
    const variables = new Map<string, string>();
    for (const declaration of chunk.slice(open + 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      variables.set(declaration[1] ?? "", (declaration[2] ?? "").trim());
    }
    blocks.push({ head: chunk.slice(0, open).trim(), variables });
  }
  return blocks;
}

/** The declarations of every rule whose selector line contains `selector`, as property to value. */
export function declarationsOf(css: string, selector: string): Array<Map<string, string>> {
  const rules: Array<Map<string, string>> = [];
  const lines = css.split("\n");
  for (let at = 0; at < lines.length; at += 1) {
    const line = lines[at]?.trim() ?? "";
    if (!line.endsWith("{") || !line.includes(selector)) continue;
    const declarations = new Map<string, string>();
    for (let next = at + 1; next < lines.length && lines[next]?.trim() !== "}"; next += 1) {
      const declaration = /^([\w-]+)\s*:\s*(.+?);?$/.exec(lines[next]?.trim() ?? "");
      if (declaration) declarations.set(declaration[1] ?? "", declaration[2] ?? "");
    }
    rules.push(declarations);
  }
  return rules;
}

/** The token a `var(--name)` value names. */
export function tokenOf(value: string | undefined, what: string): string {
  const named = /^var\((--[\w-]+)\)$/.exec(value ?? "");
  if (!named) throw new Error(`${what} is not drawn from a token: ${value ?? "(none)"}`);
  return named[1] ?? "";
}
