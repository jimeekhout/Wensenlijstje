import type { ItemDraft, ListDraft, Priority, ReservationStatus } from "./types";

const PRIORITIES: readonly Priority[] = ["hoog", "normaal", "laag"];
const STATUSES: readonly ReservationStatus[] = ["gereserveerd", "gekocht"];

export type ParsedItem = {
  name: string;
  url: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  note: string | null;
  priority: Priority | null;
};

export type ParsedList = {
  title: string;
  description: string | null;
  occasion: string | null;
};

function clean(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function parsePriceToCents(input: string): number | null | "invalid" {
  let value = clean(input).replace(/\s/g, "").replace(/€/g, "");
  if (!value) return null;

  const lastComma = value.lastIndexOf(",");
  const lastDot = value.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    value =
      lastComma > lastDot
        ? value.replace(/\./g, "").replace(",", ".")
        : value.replace(/,/g, "");
  } else if (lastComma !== -1) {
    const [whole, fraction, extra] = value.split(",");
    if (extra !== undefined || fraction === undefined) return "invalid";
    if (fraction.length === 3) value = `${whole}${fraction}`;
    else value = `${whole}.${fraction}`;
  } else if (lastDot !== -1) {
    const parts = value.split(".");
    if (parts.length !== 2) return "invalid";
    if (parts[1].length === 3) value = `${parts[0]}${parts[1]}`;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) return "invalid";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000) return "invalid";
  return Math.round(amount * 100);
}

export function parseHttpUrl(input: string): string | null | "invalid" {
  const value = clean(input);
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..") && !value.includes("\\")) {
    if (!/^\/[\w./%+-]+$/.test(value)) return "invalid";
    return value;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    if (url.username || url.password) return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}

function optionalText(input: string, max: number): string | null | "invalid" {
  const value = clean(input);
  if (!value) return null;
  if (value.length > max) return "invalid";
  return value;
}

export function parseListDraft(input: ListDraft): { ok: true; value: ParsedList } | { ok: false; error: string } {
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Geef het lijstje een titel." };
  if (title.length > 120) return { ok: false, error: "De titel mag maximaal 120 tekens zijn." };

  const description = optionalText(input.description, 800);
  if (description === "invalid") {
    return { ok: false, error: "De omschrijving mag maximaal 800 tekens zijn." };
  }

  const occasion = optionalText(input.occasion, 40);
  if (occasion === "invalid") {
    return { ok: false, error: "De gelegenheid mag maximaal 40 tekens zijn." };
  }

  return { ok: true, value: { title, description, occasion } };
}

export function parseItemDraft(input: ItemDraft): { ok: true; value: ParsedItem } | { ok: false; error: string } {
  const name = clean(input.name);
  if (!name) return { ok: false, error: "Geef het cadeau een naam." };
  if (name.length > 160) return { ok: false, error: "De naam mag maximaal 160 tekens zijn." };

  const url = parseHttpUrl(input.url);
  if (url === "invalid") {
    return { ok: false, error: "Gebruik een winkel-link die begint met https://." };
  }

  const imageUrl = parseHttpUrl(input.imageUrl);
  if (imageUrl === "invalid") {
    return { ok: false, error: "Gebruik een afbeeldingslink die begint met https://." };
  }

  const priceCents = parsePriceToCents(input.price);
  if (priceCents === "invalid") {
    return { ok: false, error: "Vul een geldig bedrag in, bijvoorbeeld 12,50." };
  }

  const note = optionalText(input.note, 800);
  if (note === "invalid") return { ok: false, error: "De notitie mag maximaal 800 tekens zijn." };

  const priorityRaw = clean(input.priority);
  let priority: Priority | null = null;
  if (priorityRaw) {
    if (!PRIORITIES.includes(priorityRaw as Priority)) {
      return { ok: false, error: "Kies een prioriteit: laag, normaal of hoog." };
    }
    priority = priorityRaw as Priority;
  }

  return { ok: true, value: { name, url, imageUrl, priceCents, note, priority } };
}

export function parseReservation(input: { status: string; name: string }):
  | { ok: true; value: { status: ReservationStatus; name: string | null } }
  | { ok: false; error: string } {
  const status = clean(input.status);
  if (!STATUSES.includes(status as ReservationStatus)) {
    return { ok: false, error: "Kies reserveren of gekocht." };
  }
  const name = optionalText(input.name, 80);
  if (name === "invalid") return { ok: false, error: "Een naam mag maximaal 80 tekens zijn." };
  return { ok: true, value: { status: status as ReservationStatus, name } };
}
