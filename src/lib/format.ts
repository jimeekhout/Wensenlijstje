export function formatDutchDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function cadeauCount(count: number) {
  if (count === 0) return "Nog geen cadeaus";
  if (count === 1) return "1 cadeau";
  return `${count} cadeaus`;
}

export function priorityLabel(priority: number | null) {
  if (priority === 1) return "Laag";
  if (priority === 2) return "Normaal";
  if (priority === 3) return "Hoog";
  return null;
}

export function cleanPersonName(input: string) {
  return input
    .replace(/[\u0000-\u001f\u007f\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
