"use server";

import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { ActionState } from "@/lib/action-state";
import { claimCookieName, getCurrentUser, isClaimCookieId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanPersonName } from "@/lib/format";
import { secretMatches, sha256 } from "@/lib/hash";

async function findItem(itemId: string) {
  if (!isClaimCookieId(itemId)) return null;
  return prisma.wishItem.findUnique({
    where: { id: itemId },
    select: { id: true, list: { select: { ownerId: true, shareToken: true } } },
  });
}

export async function claimItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const name = cleanPersonName(String(formData.get("name") ?? ""));
  if (name.length < 1 || name.length > 40) {
    return { error: "Vul je naam in (maximaal 40 tekens)." };
  }

  const item = await findItem(itemId);
  if (!item) return { error: "Dit cadeau bestaat niet meer." };

  const user = await getCurrentUser();
  if (user?.id === item.list.ownerId) {
    return { error: "Als maker van het lijstje kun je geen cadeaus afstrepen." };
  }

  const secret = randomBytes(24).toString("base64url");
  try {
    await prisma.claim.create({
      data: { itemId: item.id, claimerName: name, secretHash: sha256(secret) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Dit cadeau is net door iemand anders gereserveerd." };
    }
    throw error;
  }

  const jar = await cookies();
  jar.set(claimCookieName(item.id), secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath(`/delen/${item.list.shareToken}`);
  return { ok: true };
}

export async function unclaimItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const item = await findItem(itemId);
  if (!item) return { error: "Dit cadeau bestaat niet meer." };

  const jar = await cookies();
  const secret = jar.get(claimCookieName(item.id))?.value;
  const claim = await prisma.claim.findUnique({ where: { itemId: item.id } });
  if (!claim || !secret || !secretMatches(secret, claim.secretHash)) {
    return { error: "Alleen wie dit heeft afgestreept, kan het in deze browser weer vrijgeven." };
  }

  await prisma.claim.delete({ where: { itemId: item.id } });
  jar.delete(claimCookieName(item.id));
  revalidatePath(`/delen/${item.list.shareToken}`);
  return { ok: true };
}
