import { BUDGETS } from "@/data/taxonomy";

export type GiftIdeaLike = {
  recipients: readonly string[];
  occasions: readonly string[];
  interests: readonly string[];
  priceCents: number;
};

export type GiftFilters = {
  recipient: string | null;
  occasion: string | null;
  budgetId: string;
  interests: string[];
};

export function filterGiftIdeas<T extends GiftIdeaLike>(ideas: readonly T[], filters: GiftFilters) {
  const budget = BUDGETS.find((item) => item.id === filters.budgetId) ?? BUDGETS[0];
  return ideas.filter((idea) => {
    if (filters.recipient && !idea.recipients.includes(filters.recipient)) return false;
    if (filters.occasion && !idea.occasions.includes(filters.occasion)) return false;
    if (idea.priceCents < budget.min || idea.priceCents > budget.max) return false;
    if (filters.interests.length > 0 && !filters.interests.some((interest) => idea.interests.includes(interest))) {
      return false;
    }
    return true;
  });
}
