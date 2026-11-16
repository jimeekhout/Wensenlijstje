"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGiftIdea } from "@/data/gift-ideas";
import { parseListInput } from "@/lib/validators";

function readListFields(formData: FormData) {
  return parseListInput({
    title: String(formData.get("title") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    occasionCustom: String(formData.get("occasionCustom") ?? ""),
    eventDate: String(formData.get("eventDate") ?? ""),
  });
}

export async function createList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in om een lijstje te maken." };

  const parsed = readListFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  const count = await prisma.wishList.count({ where: { ownerId: user.id } });
  if (count >= 50) return { error: "Je hebt het maximum van 50 lijstjes bereikt." };

  const list = await prisma.wishList.create({
    data: {
      ...parsed.data,
      ownerId: user.id,
      shareToken: randomBytes(18).toString("base64url"),
    },
    select: { id: true, shareToken: true },
  });

  const idea = getGiftIdea(String(formData.get("ideaId") ?? ""));
  if (idea) {
    await prisma.wishItem.create({
      data: {
        listId: list.id,
        name: idea.name,
        description: idea.description,
        url: idea.shopUrl ?? null,
        priceCents: idea.priceCents,
        imageUrl: idea.imageUrl ?? null,
        sortOrder: 1,
      },
    });
  }

  revalidatePath("/lijsten");
  redirect(`/lijsten/${list.id}`);
}

export async function updateList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in om dit lijstje aan te passen." };
  const parsed = readListFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  const listId = String(formData.get("listId") ?? "");
  const list = await prisma.wishList.findFirst({
    where: { id: listId, ownerId: user.id },
    select: { id: true, shareToken: true },
  });
  if (!list) return { error: "Dit lijstje is niet gevonden." };

  await prisma.wishList.update({ where: { id: list.id }, data: parsed.data });
  revalidatePath("/lijsten");
  revalidatePath(`/lijsten/${list.id}`);
  revalidatePath(`/delen/${list.shareToken}`);
  return { ok: true, message: "Lijstje opgeslagen." };
}

export async function deleteList(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  const listId = String(formData.get("listId") ?? "");
  const list = await prisma.wishList.findFirst({
    where: { id: listId, ownerId: user.id },
    select: { id: true },
  });
  if (list) {
    await prisma.wishList.delete({ where: { id: list.id } });
  }
  revalidatePath("/lijsten");
  redirect("/lijsten");
}
