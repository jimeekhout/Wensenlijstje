import { BUDGETS, CATEGORIES, INTERESTS, RECIPIENTS } from "@/data/taxonomy";
import { OCCASIONS } from "@/lib/occasions";

export type GiftIdeaLike = {
  name?: string;
  description?: string;
  recipients: readonly string[];
  occasions: readonly string[];
  interests: readonly string[];
  categories?: readonly string[];
  ageGroups?: readonly string[];
  priceCents: number;
  popularity?: number;
};

export type GiftFilters = {
  q?: string;
  recipient: string | null;
  occasion: string | null;
  ageGroup: string | null;
  budgetId: string;
  interests: string[];
  categories?: string[];
};

export type GiftSort = "populair" | "prijs-op" | "prijs-af";

const labelOf = (list: readonly { id: string; label: string }[], id: string) =>
  list.find((item) => item.id === id)?.label ?? id;

export function giftSearchText(idea: GiftIdeaLike) {
  const tags = [
    ...(idea.categories ?? []).map((id) => labelOf(CATEGORIES, id)),
    ...idea.interests.map((id) => labelOf(INTERESTS, id)),
    ...idea.recipients.map((id) => labelOf(RECIPIENTS, id)),
    ...idea.occasions.map((id) => labelOf(OCCASIONS, id)),
    ...(idea.ageGroups ?? []),
  ];
  return normalize([idea.name, idea.description, ...tags].filter(Boolean).join(" "));
}

export function filterGiftIdeas<T extends GiftIdeaLike>(ideas: readonly T[], filters: GiftFilters) {
  const budget = BUDGETS.find((item) => item.id === filters.budgetId) ?? BUDGETS[0];
  const words = normalize(filters.q ?? "")
    .split(/\s+/)
    .filter(Boolean);
  return ideas.filter((idea) => {
    if (filters.recipient && !idea.recipients.includes(filters.recipient)) return false;
    if (filters.occasion && !idea.occasions.includes(filters.occasion)) return false;
    if (filters.ageGroup && !idea.ageGroups?.includes(filters.ageGroup)) return false;
    if (idea.priceCents < budget.min || idea.priceCents > budget.max) return false;
    if (filters.interests.length > 0 && !filters.interests.some((interest) => idea.interests.includes(interest))) {
      return false;
    }
    if (filters.categories && filters.categories.length > 0) {
      const categories = idea.categories ?? [];
      if (!filters.categories.some((category) => categories.includes(category))) return false;
    }
    if (words.length > 0) {
      const haystack = giftSearchText(idea);
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

export function sortGiftIdeas<T extends GiftIdeaLike>(ideas: readonly T[], sort: GiftSort) {
  const copy = [...ideas];
  const byName = (a: T, b: T) => (a.name ?? "").localeCompare(b.name ?? "", "nl");
  if (sort === "prijs-op") copy.sort((a, b) => a.priceCents - b.priceCents || byName(a, b));
  else if (sort === "prijs-af") copy.sort((a, b) => b.priceCents - a.priceCents || byName(a, b));
  else copy.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0) || byName(a, b));
  return copy;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}
