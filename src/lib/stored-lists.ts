export type StoredList = {
  id: string;
  ownerToken: string;
  title: string;
  occasion: string | null;
  updatedAt: string;
};

const KEY = "wensenlijstje.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadStoredLists(): StoredList[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredList[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.ownerToken === "string" && typeof item.title === "string");
  } catch {
    return [];
  }
}

export function upsertStoredList(list: StoredList): void {
  if (!canUseStorage()) return;
  const existing = loadStoredLists().filter((item) => item.id !== list.id && item.ownerToken !== list.ownerToken);
  existing.unshift(list);
  window.localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 30)));
}

export function removeStoredList(id: string): void {
  if (!canUseStorage()) return;
  const next = loadStoredLists().filter((item) => item.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
