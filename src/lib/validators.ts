import { isOccasionId } from "@/lib/occasions";
import { parsePriceToCents } from "@/lib/price";
import { checkPublicUrl } from "@/lib/urls";

export type ListInput = {
  title: string;
  occasion: string;
  occasionCustom: string | null;
  eventDate: Date | null;
};

export type ItemInput = {
  name: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  priority: number | null;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export function parseListInput(input: {
  title: string;
  occasion: string;
  occasionCustom: string;
  eventDate: string;
}): Result<ListInput> {
  const title = collapse(input.title);
  if (!title) return fail("Geef het lijstje een naam.");
  if (title.length > 80) return fail("Gebruik maximaal 80 tekens voor de naam.");
  if (!isOccasionId(input.occasion)) return fail("Kies een gelegenheid.");

  const custom = collapse(input.occasionCustom);
  if (input.occasion === "anders") {
    if (!custom) return fail("Vul in om welke gelegenheid het gaat.");
    if (custom.length > 40) return fail("Houd de gelegenheid onder de 40 tekens.");
  }

  const eventDate = parseDate(input.eventDate);
  if (eventDate === "invalid") return fail("Vul een geldige datum in.");

  return {
    ok: true,
    data: {
      title,
      occasion: input.occasion,
      occasionCustom: input.occasion === "anders" ? custom : null,
      eventDate,
    },
  };
}

export function parseItemInput(input: {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  priority: string;
}): Result<ItemInput> {
  const name = collapse(input.name);
  if (!name) return fail("Geef het cadeau een naam.");
  if (name.length > 120) return fail("Gebruik maximaal 120 tekens voor de naam.");

  const description = input.description.trim();
  if (description.length > 2000) return fail("De omschrijving is te lang.");

  const url = optionalUrl(input.url);
  if (typeof url !== "string" && url !== null) return url;
  const imageUrl = optionalImage(input.imageUrl);
  if (typeof imageUrl !== "string" && imageUrl !== null) return imageUrl;

  const priceRaw = input.price.trim();
  let priceCents: number | null = null;
  if (priceRaw) {
    priceCents = parsePriceToCents(priceRaw);
    if (priceCents == null) return fail("Vul een geldige prijs in, bijvoorbeeld 19,95.");
  }

  const priorityRaw = input.priority.trim();
  let priority: number | null = null;
  if (priorityRaw) {
    if (!["1", "2", "3"].includes(priorityRaw)) return fail("Kies een geldige prioriteit.");
    priority = Number(priorityRaw);
  }

  return {
    ok: true,
    data: {
      name,
      description: description || null,
      url,
      imageUrl,
      priceCents,
      priority,
    },
  };
}

function optionalUrl(value: string): string | null | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return fail("Die link is te lang.");
  const checked = checkPublicUrl(trimmed);
  if (!checked.ok) {
    return fail(
      checked.code === "PRIVATE_URL"
        ? "Die link kunnen we niet gebruiken."
        : "Vul een geldige link in die begint met http:// of https://.",
    );
  }
  return checked.url.toString();
}

function optionalImage(value: string): string | null | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\/cadeaus\/[a-z0-9-]+\.svg$/.test(trimmed)) return trimmed;
  return optionalUrl(trimmed);
}

function parseDate(value: string): Date | null | "invalid" {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "invalid";
  const date = new Date(`${raw}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "invalid";
  return date;
}

function collapse(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}
