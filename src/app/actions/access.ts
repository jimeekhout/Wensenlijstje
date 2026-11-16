"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasListAccess, listAccessCookieName, listAccessToken } from "@/lib/list-access";

export async function unlockList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const shareToken = String(formData.get("shareToken") ?? "");
  const password = String(formData.get("password") ?? "");
  const list = await prisma.wishList.findUnique({
    where: { shareToken },
    select: { accessHash: true },
  });
  if (!list?.accessHash) return { error: "Dit lijstje is niet afgeschermd." };
  const ok = await verifyPassword(password, list.accessHash);
  if (!ok) return { error: "Dat wachtwoord klopt niet. Vraag het na bij degene die het lijstje deelde." };
  const jar = await cookies();
  jar.set(listAccessCookieName(shareToken), listAccessToken(shareToken, list.accessHash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath(`/delen/${shareToken}`);
  redirect(`/delen/${shareToken}`);
}

export async function listIsUnlocked(shareToken: string, accessHash: string) {
  const jar = await cookies();
  return hasListAccess(jar.get(listAccessCookieName(shareToken))?.value, shareToken, accessHash);
}
