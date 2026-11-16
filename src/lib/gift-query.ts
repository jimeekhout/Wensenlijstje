import { AGE_GROUPS, BUDGETS, CATEGORIES, RECIPIENTS } from "@/data/taxonomy";
import type { GiftSort } from "@/lib/gift-filter";
import { OCCASIONS } from "@/lib/occasions";

export const GIFT_SORTS = [
  { id: "populair", label: "Populair" },
  { id: "prijs-op", label: "Prijs laag–hoog" },
  { id: "prijs-af", label: "Prijs hoog–laag" },
] as const satisfies readonly { id: GiftSort; label: string }[];

export type GiftQuery = {
  q: string;
  recipient: string | null;
  occasion: string | null;
  ageGroup: string | null;
  budgetId: string;
  categories: string[];
  sort: GiftSort;
};

type Reader = { get(name: string): string | null };

const empty: GiftQuery = {
  q: "",
  recipient: null,
  occasion: null,
  ageGroup: null,
  budgetId: "all",
  categories: [],
  sort: "populair",
};

export function parseGiftQuery(input: Reader): GiftQuery {
  const q = (input.get("q") ?? "").trim().slice(0, 80);
  const categories = [
    ...new Set(
      (input.get("categorie") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter((id) => CATEGORIES.some((item) => item.id === id)),
    ),
  ];
  const sortRaw = input.get("sorteer");
  const sort = GIFT_SORTS.some((item) => item.id === sortRaw) ? (sortRaw as GiftSort) : "populair";
  return {
    q,
    recipient: oneOf(input.get("voor"), RECIPIENTS),
    occasion: oneOf(input.get("gelegenheid"), OCCASIONS),
    ageGroup: oneOf(input.get("leeftijd"), AGE_GROUPS),
    budgetId: BUDGETS.some((item) => item.id === input.get("budget")) ? (input.get("budget") as string) : "all",
    categories,
    sort,
  };
}

export function giftQueryString(query: GiftQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.recipient) params.set("voor", query.recipient);
  if (query.occasion) params.set("gelegenheid", query.occasion);
  if (query.ageGroup) params.set("leeftijd", query.ageGroup);
  if (query.budgetId !== "all") params.set("budget", query.budgetId);
  if (query.categories.length) params.set("categorie", query.categories.join(","));
  if (query.sort !== "populair") params.set("sorteer", query.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function emptyGiftQuery(): GiftQuery {
  return { ...empty, categories: [] };
}

function oneOf(value: string | null, list: readonly { id: string }[]) {
  if (!value) return null;
  return list.some((item) => item.id === value) ? value : null;
}
