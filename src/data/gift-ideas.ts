import catalogJson from "@/data/gift-ideas.json";
import { giftCatalogSchema, type GiftIdea } from "@/data/schema";

const catalog = giftCatalogSchema.parse(catalogJson);

export const giftCatalogNotice = catalog.notice;
export const giftIdeas: GiftIdea[] = catalog.ideas;

const byId = new Map(giftIdeas.map((idea) => [idea.id, idea]));

export function getGiftIdea(id: string) {
  return byId.get(id) ?? null;
}
