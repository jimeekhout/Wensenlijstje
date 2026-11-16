import { getDb, transaction } from "./db";
import { createPublicId, createSecret } from "./ids";
import type {
  ActionResult,
  ItemDraft,
  ListDraft,
  OwnerItem,
  OwnerWishlist,
  Priority,
  PublicItem,
  PublicWishlist,
  ReservationInfo,
  ReservationStatus,
} from "./types";
import { parseItemDraft, parseListDraft, parseReservation } from "./validate";

const MAX_ITEMS = 150;

type WishlistRow = {
  id: string;
  owner_token: string;
  title: string;
  description: string | null;
  occasion: string | null;
  revision: number;
};

type ItemRow = {
  id: string;
  name: string;
  url: string | null;
  price_cents: number | null;
  image_url: string | null;
  note: string | null;
  priority: string | null;
  position: number;
};

type ReservationRow = {
  status: string;
  reserver_name: string | null;
  visitor_id: string;
};

function now(): string {
  return new Date().toISOString();
}

function asPriority(value: string | null): Priority | null {
  if (value === "hoog" || value === "normaal" || value === "laag") return value;
  return null;
}

function toOwnerItem(row: ItemRow): OwnerItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
    note: row.note,
    priority: asPriority(row.priority),
    position: row.position,
  };
}

function readWishlistByToken(token: string): WishlistRow | null {
  const row = getDb()
    .prepare(
      `SELECT id, owner_token, title, description, occasion, revision
       FROM wishlists WHERE owner_token = ?`,
    )
    .get(token) as WishlistRow | undefined;
  return row ?? null;
}

function readWishlistById(id: string): WishlistRow | null {
  const row = getDb()
    .prepare(
      `SELECT id, owner_token, title, description, occasion, revision
       FROM wishlists WHERE id = ?`,
    )
    .get(id) as WishlistRow | undefined;
  return row ?? null;
}

function readItems(wishlistId: string): ItemRow[] {
  return getDb()
    .prepare(
      `SELECT id, name, url, price_cents, image_url, note, priority, position
       FROM items
       WHERE wishlist_id = ?
       ORDER BY position ASC, created_at ASC`,
    )
    .all(wishlistId) as ItemRow[];
}

function toOwnerWishlist(row: WishlistRow): OwnerWishlist {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    occasion: row.occasion,
    revision: row.revision,
    items: readItems(row.id).map(toOwnerItem),
  };
}

function bump(wishlistId: string): void {
  getDb()
    .prepare(`UPDATE wishlists SET revision = revision + 1, updated_at = ? WHERE id = ?`)
    .run(now(), wishlistId);
}

function renumber(wishlistId: string, ids: string[]): void {
  const statement = getDb().prepare(
    `UPDATE items SET position = ?, updated_at = ? WHERE id = ? AND wishlist_id = ?`,
  );
  const timestamp = now();
  ids.forEach((id, index) => {
    statement.run(index, timestamp, id, wishlistId);
  });
}

export function createWishlist(draft: ListDraft): ActionResult<{ ownerToken: string; list: OwnerWishlist }> {
  const parsed = parseListDraft(draft);
  if (!parsed.ok) return parsed;

  const id = createPublicId();
  const ownerToken = createSecret();
  const timestamp = now();
  getDb()
    .prepare(
      `INSERT INTO wishlists (id, owner_token, title, description, occasion, revision, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(id, ownerToken, parsed.value.title, parsed.value.description, parsed.value.occasion, timestamp, timestamp);

  const list = getOwnerWishlist(ownerToken);
  if (!list) return { ok: false, error: "Het lijstje kon niet worden aangemaakt." };
  return { ok: true, data: { ownerToken, list } };
}

/**
 * Owner view. This query never reads the reservations table.
 * Keeping reservation data out of the result is what preserves the surprise.
 */
export function getOwnerWishlist(token: string): OwnerWishlist | null {
  const row = readWishlistByToken(token);
  if (!row) return null;
  return toOwnerWishlist(row);
}

export function updateWishlist(token: string, draft: ListDraft): ActionResult<OwnerWishlist> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };
  const parsed = parseListDraft(draft);
  if (!parsed.ok) return parsed;

  transaction(() => {
    getDb()
      .prepare(
        `UPDATE wishlists
         SET title = ?, description = ?, occasion = ?, revision = revision + 1, updated_at = ?
         WHERE id = ?`,
      )
      .run(parsed.value.title, parsed.value.description, parsed.value.occasion, now(), existing.id);
  });

  const list = getOwnerWishlist(token);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: list };
}

export function deleteWishlist(token: string): ActionResult<{ id: string }> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };
  transaction(() => {
    getDb().prepare(`DELETE FROM wishlists WHERE id = ?`).run(existing.id);
  });
  return { ok: true, data: { id: existing.id } };
}

export function addItem(token: string, draft: ItemDraft): ActionResult<OwnerWishlist> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };
  const parsed = parseItemDraft(draft);
  if (!parsed.ok) return parsed;

  const countRow = getDb()
    .prepare(`SELECT COUNT(*) AS count FROM items WHERE wishlist_id = ?`)
    .get(existing.id) as { count: number };
  if (countRow.count >= MAX_ITEMS) {
    return { ok: false, error: `Een lijstje kan maximaal ${MAX_ITEMS} cadeaus bevatten.` };
  }

  const positionRow = getDb()
    .prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS position FROM items WHERE wishlist_id = ?`)
    .get(existing.id) as { position: number };

  const timestamp = now();
  transaction(() => {
    getDb()
      .prepare(
        `INSERT INTO items (
           id, wishlist_id, name, url, price_cents, image_url, note, priority, position, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        createPublicId(),
        existing.id,
        parsed.value.name,
        parsed.value.url,
        parsed.value.priceCents,
        parsed.value.imageUrl,
        parsed.value.note,
        parsed.value.priority,
        positionRow.position,
        timestamp,
        timestamp,
      );
    bump(existing.id);
  });

  const list = getOwnerWishlist(token);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: list };
}

export function updateItem(token: string, itemId: string, draft: ItemDraft): ActionResult<OwnerWishlist> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };
  const item = getDb()
    .prepare(`SELECT id FROM items WHERE id = ? AND wishlist_id = ?`)
    .get(itemId, existing.id) as { id: string } | undefined;
  if (!item) return { ok: false, error: "Dit cadeau staat niet (meer) op het lijstje." };

  const parsed = parseItemDraft(draft);
  if (!parsed.ok) return parsed;

  transaction(() => {
    getDb()
      .prepare(
        `UPDATE items
         SET name = ?, url = ?, price_cents = ?, image_url = ?, note = ?, priority = ?, updated_at = ?
         WHERE id = ? AND wishlist_id = ?`,
      )
      .run(
        parsed.value.name,
        parsed.value.url,
        parsed.value.priceCents,
        parsed.value.imageUrl,
        parsed.value.note,
        parsed.value.priority,
        now(),
        itemId,
        existing.id,
      );
    bump(existing.id);
  });

  const list = getOwnerWishlist(token);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: list };
}

export function deleteItem(token: string, itemId: string): ActionResult<OwnerWishlist> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };

  transaction(() => {
    const result = getDb().prepare(`DELETE FROM items WHERE id = ? AND wishlist_id = ?`).run(itemId, existing.id);
    const changes = Number((result as { changes?: number }).changes ?? 0);
    if (changes === 0) return;
    const remaining = readItems(existing.id).map((item) => item.id);
    renumber(existing.id, remaining);
    bump(existing.id);
  });

  const list = getOwnerWishlist(token);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: list };
}

export function moveItem(token: string, itemId: string, direction: -1 | 1): ActionResult<OwnerWishlist> {
  const existing = readWishlistByToken(token);
  if (!existing) return { ok: false, error: "Dit lijstje is niet gevonden." };
  const ids = readItems(existing.id).map((item) => item.id);
  const index = ids.indexOf(itemId);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ids.length) {
    const list = getOwnerWishlist(token);
    if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
    return { ok: true, data: list };
  }

  const next = [...ids];
  const swapped = next[target];
  const current = next[index];
  if (!swapped || !current) {
    return { ok: false, error: "De volgorde kon niet worden aangepast." };
  }
  next[index] = swapped;
  next[target] = current;

  transaction(() => {
    renumber(existing.id, next);
    bump(existing.id);
  });

  const list = getOwnerWishlist(token);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: list };
}

function reservationFor(itemId: string, visitorId: string | null, include: boolean): ReservationInfo | null {
  if (!include) return null;
  const row = getDb()
    .prepare(`SELECT status, reserver_name, visitor_id FROM reservations WHERE item_id = ?`)
    .get(itemId) as ReservationRow | undefined;
  if (!row) return null;
  const status: ReservationStatus = row.status === "gekocht" ? "gekocht" : "gereserveerd";
  return {
    status,
    name: row.reserver_name,
    mine: visitorId != null && row.visitor_id === visitorId,
  };
}

export function getPublicWishlist(
  id: string,
  viewer: { includeReservations: boolean; visitorId: string | null },
): PublicWishlist | null {
  const row = readWishlistById(id);
  if (!row) return null;
  const items: PublicItem[] = readItems(row.id).map((item) => ({
    ...toOwnerItem(item),
    reservation: reservationFor(item.id, viewer.visitorId, viewer.includeReservations),
  }));
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    occasion: row.occasion,
    revision: row.revision,
    ownerView: !viewer.includeReservations,
    items,
  };
}

function reloadPublic(listId: string, visitorId: string): PublicWishlist | null {
  return getPublicWishlist(listId, { includeReservations: true, visitorId });
}

export function reserveItem(
  listId: string,
  itemId: string,
  visitorId: string,
  input: { status: string; name: string },
): ActionResult<PublicWishlist> {
  const list = readWishlistById(listId);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };
  const item = getDb()
    .prepare(`SELECT id FROM items WHERE id = ? AND wishlist_id = ?`)
    .get(itemId, listId) as { id: string } | undefined;
  if (!item) return { ok: false, error: "Dit cadeau staat niet (meer) op het lijstje." };

  const parsed = parseReservation(input);
  if (!parsed.ok) return parsed;

  const existing = getDb()
    .prepare(`SELECT visitor_id FROM reservations WHERE item_id = ?`)
    .get(itemId) as { visitor_id: string } | undefined;

  if (existing && existing.visitor_id !== visitorId) {
    return { ok: false, error: "Dit cadeau is al door iemand anders gereserveerd." };
  }

  const timestamp = now();
  try {
    transaction(() => {
      if (existing) {
        getDb()
          .prepare(
            `UPDATE reservations
             SET status = ?, reserver_name = ?, updated_at = ?
             WHERE item_id = ? AND visitor_id = ?`,
          )
          .run(parsed.value.status, parsed.value.name, timestamp, itemId, visitorId);
      } else {
        getDb()
          .prepare(
            `INSERT INTO reservations (item_id, status, reserver_name, visitor_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .run(itemId, parsed.value.status, parsed.value.name, visitorId, timestamp, timestamp);
      }
      bump(listId);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE") || message.includes("constraint")) {
      return { ok: false, error: "Dit cadeau is net door iemand anders gereserveerd." };
    }
    throw error;
  }

  const updated = reloadPublic(listId, visitorId);
  if (!updated) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: updated };
}

export function clearReservation(
  listId: string,
  itemId: string,
  visitorId: string,
): ActionResult<PublicWishlist> {
  const list = readWishlistById(listId);
  if (!list) return { ok: false, error: "Dit lijstje is niet gevonden." };

  const existing = getDb()
    .prepare(`SELECT visitor_id FROM reservations WHERE item_id = ?`)
    .get(itemId) as { visitor_id: string } | undefined;
  if (!existing) {
    const current = reloadPublic(listId, visitorId);
    if (!current) return { ok: false, error: "Dit lijstje is niet gevonden." };
    return { ok: true, data: current };
  }
  if (existing.visitor_id !== visitorId) {
    return { ok: false, error: "Alleen wie dit cadeau gereserveerd heeft, kan dat intrekken." };
  }

  transaction(() => {
    getDb().prepare(`DELETE FROM reservations WHERE item_id = ? AND visitor_id = ?`).run(itemId, visitorId);
    bump(listId);
  });

  const updated = reloadPublic(listId, visitorId);
  if (!updated) return { ok: false, error: "Dit lijstje is niet gevonden." };
  return { ok: true, data: updated };
}
