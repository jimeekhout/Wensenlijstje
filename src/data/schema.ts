import { z } from "zod";
import { OCCASION_IDS } from "@/lib/occasions";
import { checkPublicUrl } from "@/lib/urls";
import { AGE_GROUPS, CATEGORIES, GIFT_ARTS, INTERESTS, RECIPIENTS } from "@/data/taxonomy";

const recipientIds = RECIPIENTS.map((item) => item.id) as [
  (typeof RECIPIENTS)[number]["id"],
  ...(typeof RECIPIENTS)[number]["id"][],
];
const interestIds = INTERESTS.map((item) => item.id) as [
  (typeof INTERESTS)[number]["id"],
  ...(typeof INTERESTS)[number]["id"][],
];
const ageIds = AGE_GROUPS.map((item) => item.id) as [
  (typeof AGE_GROUPS)[number]["id"],
  ...(typeof AGE_GROUPS)[number]["id"][],
];
const categoryIds = CATEGORIES.map((item) => item.id) as [
  (typeof CATEGORIES)[number]["id"],
  ...(typeof CATEGORIES)[number]["id"][],
];

export const giftIdeaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{3,40}$/),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(280),
  priceCents: z.number().int().positive().max(99_999_900),
  art: z.enum(GIFT_ARTS),
  image: z.string().regex(/^\/cadeaus\/[a-z0-9-]+\.svg$/),
  imageAlt: z.string().trim().min(8).max(160),
  imageUrl: z.string().url().optional(),
  shopUrl: z.string().url().optional(),
  recipients: z.array(z.enum(recipientIds)).min(1),
  occasions: z.array(z.enum(OCCASION_IDS)).min(1),
  interests: z.array(z.enum(interestIds)).min(1),
  categories: z.array(z.enum(categoryIds)).min(1),
  ageGroups: z.array(z.enum(ageIds)).min(1),
  popularity: z.number().int().min(0).max(100).default(0),
});

export const giftCatalogSchema = z
  .object({
    notice: z.string().min(1),
    ideas: z.array(giftIdeaSchema).min(1),
  })
  .superRefine((catalog, ctx) => {
    const ids = new Set<string>();
    for (const idea of catalog.ideas) {
      if (ids.has(idea.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Dubbel idee-id: ${idea.id}` });
      }
      ids.add(idea.id);
      if (idea.shopUrl && !checkPublicUrl(idea.shopUrl).ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Ongeldige shoplink bij ${idea.id}` });
      }
      if (idea.imageUrl && !checkPublicUrl(idea.imageUrl).ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Ongeldige afbeelding bij ${idea.id}` });
      }
    }
  });

export type GiftIdea = z.infer<typeof giftIdeaSchema>;
