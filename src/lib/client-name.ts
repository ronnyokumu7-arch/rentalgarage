export function normalizePersonName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, separator: string, letter: string) =>
      `${separator}${letter.toLocaleUpperCase()}`
    );
}

export function getClientDisplayName(name?: string | null): string {
  return normalizePersonName(name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}
