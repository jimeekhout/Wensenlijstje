"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { OWNER_COOKIE, VISITOR_COOKIE, cookieOptions, parseOwnerIds, serializeOwnerIds } from "./cookies";
import { createSecret } from "./ids";
import type { ItemDraft, ListDraft, PublicWishlist } from "./types";
import {
  addItem,
  clearReservation,
  createWishlist,
  deleteItem,
  deleteWishlist,
  getOwnerWishlist,
  getPublicWishlist,
  moveItem,
  reserveItem,
  updateItem,
  updateWishlist,
} from "./wishlists";

function revalidateWishlist(id: string, token?: string): void {
  revalidatePath(`/delen/${id}`);
  if (token) revalidatePath(`/lijst/${token}`);
  revalidatePath("/");
}

export async function createWishlistAction(draft: ListDraft) {
  const result = createWishlist(draft);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function rememberOwnerAction(token: string): Promise<{ ok: true; id: string } | { ok: false }> {
  const list = getOwnerWishlist(token);
  if (!list) return { ok: false };
  const jar = await cookies();
  const ids = parseOwnerIds(jar.get(OWNER_COOKIE)?.value);
  if (!ids.includes(list.id)) ids.push(list.id);
  jar.set(OWNER_COOKIE, serializeOwnerIds(ids), cookieOptions());
  return { ok: true, id: list.id };
}

export async function updateWishlistAction(token: string, draft: ListDraft) {
  const result = updateWishlist(token, draft);
  if (result.ok) revalidateWishlist(result.data.id, token);
  return result;
}

export async function deleteWishlistAction(token: string) {
  const existing = getOwnerWishlist(token);
  const result = deleteWishlist(token);
  if (result.ok) {
    revalidateWishlist(result.data.id, token);
    if (existing) {
      const jar = await cookies();
      const ids = parseOwnerIds(jar.get(OWNER_COOKIE)?.value).filter((id) => id !== existing.id);
      jar.set(OWNER_COOKIE, serializeOwnerIds(ids), cookieOptions());
    }
  }
  return result;
}

export async function addItemAction(token: string, draft: ItemDraft) {
  const result = addItem(token, draft);
  if (result.ok) revalidateWishlist(result.data.id, token);
  return result;
}

export async function updateItemAction(token: string, itemId: string, draft: ItemDraft) {
  const result = updateItem(token, itemId, draft);
  if (result.ok) revalidateWishlist(result.data.id, token);
  return result;
}

export async function deleteItemAction(token: string, itemId: string) {
  const result = deleteItem(token, itemId);
  if (result.ok) revalidateWishlist(result.data.id, token);
  return result;
}

export async function moveItemAction(token: string, itemId: string, direction: -1 | 1) {
  const result = moveItem(token, itemId, direction);
  if (result.ok) revalidateWishlist(result.data.id, token);
  return result;
}

async function visitorId(): Promise<string> {
  const jar = await cookies();
  const current = jar.get(VISITOR_COOKIE)?.value;
  if (current && /^[\w-]{16,64}$/.test(current)) return current;
  const created = createSecret();
  jar.set(VISITOR_COOKIE, created, cookieOptions());
  return created;
}

async function callerOwns(listId: string): Promise<boolean> {
  const jar = await cookies();
  return parseOwnerIds(jar.get(OWNER_COOKIE)?.value).includes(listId);
}

export async function reserveItemAction(
  listId: string,
  itemId: string,
  input: { status: string; name: string },
): Promise<{ ok: true; data: PublicWishlist } | { ok: false; error: string }> {
  if (await callerOwns(listId)) {
    return {
      ok: false,
      error: "Als eigenaar zie je geen reserveringen en kun je zelf niets reserveren op dit lijstje.",
    };
  }
  const id = await visitorId();
  const result = reserveItem(listId, itemId, id, input);
  if (result.ok) revalidatePath(`/delen/${listId}`);
  return result;
}

export async function clearReservationAction(
  listId: string,
  itemId: string,
): Promise<{ ok: true; data: PublicWishlist } | { ok: false; error: string }> {
  if (await callerOwns(listId)) {
    return { ok: false, error: "Als eigenaar kun je reserveringen niet zien of aanpassen." };
  }
  const id = await visitorId();
  const result = clearReservation(listId, itemId, id);
  if (result.ok) revalidatePath(`/delen/${listId}`);
  return result;
}
