export function getFilledLanguages(value: Record<string, string>): string[] {
  return Object.entries(value ?? {})
    .filter(([, v]) => v?.trim())
    .map(([k]) => k);
}
