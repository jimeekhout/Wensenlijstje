import { cache } from "react";
import { prisma } from "@/lib/db";

const itemSelect = {
  id: true,
  name: true,
  description: true,
  url: true,
  priceCents: true,
  imageUrl: true,
  priority: true,
} as const;

export const getOwnedList = cache(async (ownerId: string, listId: string) => {
  return prisma.wishList.findFirst({
    where: { id: listId, ownerId },
    select: {
      id: true,
      title: true,
      occasion: true,
      occasionCustom: true,
      eventDate: true,
      shareToken: true,
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: itemSelect,
      },
    },
  });
});

/** Public list payload. Claim rows are intentionally absent. */
export const getSharedList = cache(async (token: string) => {
  return prisma.wishList.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      title: true,
      occasion: true,
      occasionCustom: true,
      eventDate: true,
      shareToken: true,
      owner: { select: { id: true, name: true } },
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: itemSelect,
      },
    },
  });
});

export async function getClaimsForItems(itemIds: string[]) {
  if (itemIds.length === 0) return [];
  return prisma.claim.findMany({
    where: { itemId: { in: itemIds } },
    select: { itemId: true, claimerName: true, secretHash: true },
  });
}
