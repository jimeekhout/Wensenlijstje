"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth";
import { getGiftIdea } from "@/data/gift-ideas";
import { prisma } from "@/lib/db";

export async function addIdeaToList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in om een idee op een lijstje te zetten." };

  const idea = getGiftIdea(String(formData.get("ideaId") ?? ""));
  if (!idea) return { error: "Dit idee staat niet meer in de cadeauzoeker." };

  const list = await prisma.wishList.findFirst({
    where: { id: String(formData.get("listId") ?? ""), ownerId: user.id },
    select: {
      id: true,
      title: true,
      shareToken: true,
      _count: { select: { items: true } },
    },
  });
  if (!list) return { error: "Kies een van je lijstjes." };
  if (list._count.items >= 100) {
    return { error: "Dit lijstje heeft het maximum van 100 cadeaus bereikt." };
  }

  const last = await prisma.wishItem.aggregate({
    where: { listId: list.id },
    _max: { sortOrder: true },
  });
  await prisma.wishItem.create({
    data: {
      listId: list.id,
      name: idea.name,
      description: idea.description,
      url: idea.shopUrl ?? null,
      priceCents: idea.priceCents,
      imageUrl: idea.imageUrl ?? null,
      sortOrder: (last._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/lijsten");
  revalidatePath(`/lijsten/${list.id}`);
  revalidatePath(`/delen/${list.shareToken}`);
  return {
    ok: true,
    listId: list.id,
    listTitle: list.title,
    message: `Staat nu op ${list.title}.`,
    nonce: crypto.randomUUID(),
  };
}
