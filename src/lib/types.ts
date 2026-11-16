export type Priority = "hoog" | "normaal" | "laag";

export type ReservationStatus = "gereserveerd" | "gekocht";

export type ItemDraft = {
  name: string;
  url: string;
  price: string;
  imageUrl: string;
  note: string;
  priority: string;
};

export type ListDraft = {
  title: string;
  description: string;
  occasion: string;
};

export type OwnerItem = {
  id: string;
  name: string;
  url: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  note: string | null;
  priority: Priority | null;
  position: number;
};

export type OwnerWishlist = {
  id: string;
  title: string;
  description: string | null;
  occasion: string | null;
  revision: number;
  items: OwnerItem[];
};

export type ReservationInfo = {
  status: ReservationStatus;
  name: string | null;
  mine: boolean;
};

export type PublicItem = OwnerItem & {
  reservation: ReservationInfo | null;
};

export type PublicWishlist = {
  id: string;
  title: string;
  description: string | null;
  occasion: string | null;
  revision: number;
  ownerView: boolean;
  items: PublicItem[];
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const emptyItemDraft = (): ItemDraft => ({
  name: "",
  url: "",
  price: "",
  imageUrl: "",
  note: "",
  priority: "",
});
