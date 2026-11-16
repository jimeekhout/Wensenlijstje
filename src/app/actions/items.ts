"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseItemInput } from "@/lib/validators";

function readItem(formData: FormData) {
  return parseItemInput({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    url: String(formData.get("url") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    price: String(formData.get("price") ?? ""),
    priority: String(formData.get("priority") ?? ""),
  });
}

async function ownedList(userId: string, listId: string) {
  return prisma.wishList.findFirst({
    where: { id: listId, ownerId: userId },
    select: { id: true, shareToken: true, _count: { select: { items: true } } },
  });
}

function refresh(list: { id: string; shareToken: string }) {
  revalidatePath("/lijsten");
  revalidatePath(`/lijsten/${list.id}`);
  revalidatePath(`/delen/${list.shareToken}`);
}

export async function createItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in om een cadeau toe te voegen." };
  const parsed = readItem(formData);
  if (!parsed.ok) return { error: parsed.error };

  const list = await ownedList(user.id, String(formData.get("listId") ?? ""));
  if (!list) return { error: "Dit lijstje is niet gevonden." };
  if (list._count.items >= 100) {
    return { error: "Dit lijstje heeft het maximum van 100 cadeaus bereikt." };
  }

  const last = await prisma.wishItem.aggregate({
    where: { listId: list.id },
    _max: { sortOrder: true },
  });
  await prisma.wishItem.create({
    data: {
      ...parsed.data,
      listId: list.id,
      sortOrder: (last._max.sortOrder ?? 0) + 1,
    },
  });
  refresh(list);
  return { ok: true, message: "Cadeau toegevoegd.", nonce: crypto.randomUUID() };
}

export async function updateItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in om dit cadeau aan te passen." };
  const parsed = readItem(formData);
  if (!parsed.ok) return { error: parsed.error };

  const item = await prisma.wishItem.findFirst({
    where: { id: String(formData.get("itemId") ?? ""), list: { ownerId: user.id } },
    select: { id: true, list: { select: { id: true, shareToken: true } } },
  });
  if (!item) return { error: "Dit cadeau is niet gevonden." };

  await prisma.wishItem.update({ where: { id: item.id }, data: parsed.data });
  refresh(item.list);
  return { ok: true, message: "Cadeau opgeslagen.", nonce: crypto.randomUUID() };
}

export async function deleteItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  const item = await prisma.wishItem.findFirst({
    where: { id: String(formData.get("itemId") ?? ""), list: { ownerId: user.id } },
    select: { id: true, list: { select: { id: true, shareToken: true } } },
  });
  if (item) {
    await prisma.wishItem.delete({ where: { id: item.id } });
    refresh(item.list);
  }
}
