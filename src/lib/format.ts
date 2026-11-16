export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function cadeauLabel(count: number): string {
  return count === 1 ? "1 cadeau" : `${count} cadeaus`;
}

export function siteName(url: string): string {
  if (url.startsWith("/")) return url;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "de winkel";
  }
}

export function reservedSummary(reserved: number, total: number): string {
  if (total === 0) return "Er staan nog geen cadeaus op dit lijstje.";
  if (reserved === 0) return "Nog niets gereserveerd. Alles is nog vrij.";
  if (reserved === 1) return "1 cadeau is al gereserveerd of gekocht.";
  return `${reserved} cadeaus zijn al gereserveerd of gekocht.`;
}
