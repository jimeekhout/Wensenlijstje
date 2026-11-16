import { GiftFinder, type GiftCard } from "@/components/gift-finder";
import { giftIdeas } from "@/data/gift-ideas";
import { applyAffiliate } from "@/lib/affiliate";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shopLabel } from "@/lib/urls";

export const metadata = {
  title: "Cadeauzoeker",
  description: "Zoek een cadeau-idee op gelegenheid, leeftijd en budget.",
};

export default async function GiftFinderPage() {
  const user = await getCurrentUser();
  const lists = user
    ? await prisma.wishList.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true },
      })
    : null;

  const cards: GiftCard[] = giftIdeas.map((idea) => {
    const shopUrl = idea.shopUrl ? applyAffiliate(idea.shopUrl) : undefined;
    return {
      id: idea.id,
      name: idea.name,
      description: idea.description,
      priceCents: idea.priceCents,
      art: idea.art,
      shopUrl,
      shopName: shopUrl ? shopLabel(shopUrl) : undefined,
      recipients: [...idea.recipients],
      occasions: [...idea.occasions],
      interests: [...idea.interests],
      ageGroups: [...idea.ageGroups],
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <div className="max-w-2xl">
        <h1 className="text-5xl">Cadeauzoeker</h1>
        <p className="mt-2 text-lg text-muted">
          Filter op gelegenheid, leeftijd en budget. Zet een idee daarna op een van je lijstjes.
        </p>
      </div>
      <p className="note max-w-2xl">
        Dit is een eerste reeks voorbeeldideeën. Prijzen zijn richtprijzen en de links zoeken op een webshop, ze wijzen nog niet naar één vast product.
      </p>
      <GiftFinder ideas={cards} lists={lists} />
    </div>
  );
}
