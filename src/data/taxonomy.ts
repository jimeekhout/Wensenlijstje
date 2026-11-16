export const GIFT_ARTS = [
  "warm",
  "book",
  "audio",
  "outdoor",
  "baby",
  "play",
  "kitchen",
  "sport",
  "creative",
  "tech",
] as const;

export type GiftArt = (typeof GIFT_ARTS)[number];

export const RECIPIENTS = [
  { id: "vrouw", label: "Vrouw" },
  { id: "man", label: "Man" },
  { id: "tiener", label: "Tiener" },
  { id: "kind", label: "Kind" },
  { id: "baby", label: "Baby" },
] as const;

export const INTERESTS = [
  { id: "koken", label: "Koken" },
  { id: "lezen", label: "Lezen" },
  { id: "sport", label: "Sport" },
  { id: "creatief", label: "Creatief" },
  { id: "techniek", label: "Techniek" },
  { id: "buiten", label: "Buiten" },
  { id: "wellness", label: "Wellness" },
  { id: "spelen", label: "Spelen" },
  { id: "muziek", label: "Muziek" },
  { id: "mode", label: "Mode" },
  { id: "verzorging", label: "Verzorging" },
] as const;

export const BUDGETS = [
  { id: "all", label: "Alle prijzen", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "t15", label: "Tot € 15", min: 0, max: 1500 },
  { id: "15-30", label: "€ 15 – € 30", min: 1501, max: 3000 },
  { id: "30-50", label: "€ 30 – € 50", min: 3001, max: 5000 },
  { id: "50-100", label: "€ 50 – € 100", min: 5001, max: 10_000 },
  { id: "100+", label: "Meer dan € 100", min: 10_001, max: Number.POSITIVE_INFINITY },
] as const;

export type RecipientId = (typeof RECIPIENTS)[number]["id"];
export type InterestId = (typeof INTERESTS)[number]["id"];
