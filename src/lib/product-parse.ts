import { load, type CheerioAPI } from "cheerio";
import { parseMetadataPriceToCents } from "@/lib/price";
import { checkPublicUrl } from "@/lib/urls";

export type ProductDraft = {
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  canonicalUrl: string | null;
};

type JsonRecord = Record<string, unknown>;

export function parseProductHtml(html: string, pageUrl: string): ProductDraft {
  const $ = load(html);
  const product = findProduct($);
  const siteName = metaContent($, "og:site_name");

  const name = clipText(
    cleanTitle(
      textValue(product?.name) ||
        metaContent($, "og:title") ||
        metaContent($, "twitter:title") ||
        microValue($, "name") ||
        $("title").first().text(),
      siteName,
    ),
    120,
  );

  const description = clipText(
    plainText(
      textValue(product?.description) ||
        metaContent($, "og:description") ||
        metaContent($, "twitter:description") ||
        $('meta[name="description"]').attr("content") ||
        microValue($, "description") ||
        "",
    ),
    400,
  );

  const imageUrl = firstUrl(
    [
      ...readImages(product?.image),
      metaContent($, "og:image") ?? "",
      metaContent($, "og:image:secure_url") ?? "",
      metaContent($, "twitter:image") ?? "",
      microValue($, "image"),
    ],
    pageUrl,
  );

  const priceCents = readPrice($, product);
  const canonicalUrl = metaContent($, "og:url");

  return {
    name: name || null,
    description: description && description !== name ? description : null,
    imageUrl,
    priceCents,
    canonicalUrl,
  };
}

function findProduct($: CheerioAPI): JsonRecord | null {
  const products: JsonRecord[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) return;
    try {
      collectProducts(JSON.parse(raw) as unknown, products, 0);
    } catch {
      // A broken block should not hide the Open Graph tags.
    }
  });
  return products.find((product) => product.offers) ?? products[0] ?? null;
}

function collectProducts(node: unknown, products: JsonRecord[], depth: number) {
  if (depth > 8 || node == null) return;
  if (Array.isArray(node)) {
    for (const entry of node) collectProducts(entry, products, depth + 1);
    return;
  }
  if (typeof node !== "object") return;
  const record = node as JsonRecord;
  if (isProductType(record["@type"])) products.push(record);
  if (record["@graph"]) collectProducts(record["@graph"], products, depth + 1);
  if (record.mainEntity) collectProducts(record.mainEntity, products, depth + 1);
}

function isProductType(type: unknown) {
  const values = Array.isArray(type) ? type : type ? [type] : [];
  return values.some((entry) => {
    if (typeof entry !== "string") return false;
    return entry.split("/").pop()?.toLowerCase() === "product";
  });
}

function metaContent($: CheerioAPI, key: string) {
  const content =
    $(`meta[property="${key}"]`).first().attr("content") ||
    $(`meta[name="${key}"]`).first().attr("content");
  const trimmed = content?.replace(/\s+/g, " ").trim();
  return trimmed || null;
}

function microValue($: CheerioAPI, name: string) {
  const scope = $("[itemtype*='schema.org/Product'], [itemtype*='Product']").first();
  const node = (scope.length ? scope.find(`[itemprop="${name}"]`) : $(`[itemprop="${name}"]`)).first();
  if (!node.length) return "";
  return node.attr("content") || node.attr("src") || node.text() || "";
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readImages(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((entry) => readImages(entry));
  if (typeof value === "object") {
    const record = value as JsonRecord;
    if (typeof record.url === "string") return [record.url];
    if (typeof record.contentUrl === "string") return [record.contentUrl];
  }
  return [];
}

function firstUrl(values: string[], base: string) {
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed, base);
      if (checkPublicUrl(url.toString()).ok) return url.toString();
    } catch {
      continue;
    }
  }
  return null;
}

function readPrice($: CheerioAPI, product: JsonRecord | null) {
  const fromJson = product ? readOfferPrice(product.offers) : null;
  if (fromJson != null) return fromJson;

  const amount = metaContent($, "product:price:amount") || metaContent($, "og:price:amount");
  const currency = metaContent($, "product:price:currency") || metaContent($, "og:price:currency");
  if (amount && currencyOk(currency)) {
    const parsed = parseMetadataPriceToCents(amount);
    if (parsed != null) return parsed;
  }

  const micro = microValue($, "price");
  const microCurrency = microValue($, "priceCurrency");
  if (micro && currencyOk(microCurrency)) return parseMetadataPriceToCents(micro);
  return null;
}

function readOfferPrice(offers: unknown): number | null {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  const ranked = [
    ...list.filter((offer) => isInStock(offer)),
    ...list.filter((offer) => !isInStock(offer)),
  ];
  for (const offer of ranked) {
    const price = priceFromOffer(offer);
    if (price != null) return price;
  }
  return null;
}

function isInStock(offer: unknown) {
  if (!offer || typeof offer !== "object") return false;
  const availability = (offer as JsonRecord).availability;
  return typeof availability === "string" && availability.toLowerCase().includes("instock");
}

function priceFromOffer(offer: unknown): number | null {
  if (!offer || typeof offer !== "object") return null;
  const record = offer as JsonRecord;
  const type = typeof record["@type"] === "string" ? record["@type"] : "";
  if (type.toLowerCase().includes("aggregateoffer") && record.lowPrice != null) {
    return priced(record.lowPrice, record.priceCurrency);
  }
  if (record.price != null) return priced(record.price, record.priceCurrency);
  const spec = Array.isArray(record.priceSpecification)
    ? record.priceSpecification[0]
    : record.priceSpecification;
  if (spec && typeof spec === "object") {
    const priceSpec = spec as JsonRecord;
    if (priceSpec.price != null) {
      return priced(priceSpec.price, priceSpec.priceCurrency ?? record.priceCurrency);
    }
  }
  return null;
}

function priced(amount: unknown, currency: unknown) {
  if (!currencyOk(typeof currency === "string" ? currency : null)) return null;
  return parseMetadataPriceToCents(String(amount));
}

function currencyOk(currency: string | null | undefined) {
  if (!currency || !currency.trim()) return true;
  return currency.trim().toUpperCase() === "EUR";
}

function cleanTitle(title: string, siteName: string | null) {
  const value = title.replace(/\s+/g, " ").trim();
  if (!siteName) return value;
  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(`\\s*[|\\-–—:]\\s*${escaped}\\s*$`, "i"), "").trim();
}

function plainText(value: string) {
  const without = value
    .slice(0, 20_000)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/\\(?=[,.;:!?])/g, "");
  return load(`<div>${without}</div>`)("div").text().replace(/\s+/g, " ").trim();
}

function clipText(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const atWord = sliced.replace(/\s+\S*$/, "").trim();
  const base = atWord.length >= Math.min(40, max / 2) ? atWord : sliced.trim();
  return `${base}…`;
}
