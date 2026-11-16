export const OCCASION_IDS = [
  "verjaardag",
  "sinterklaas",
  "kerst",
  "babyshower",
  "geboorte",
  "anders",
] as const;

export type OccasionId = (typeof OCCASION_IDS)[number];

export type Occasion = {
  id: OccasionId;
  label: string;
  hint: string;
};

export const OCCASIONS: Occasion[] = [
  { id: "verjaardag", label: "Verjaardag", hint: "Een jaar ouder, een lijstje rijker" },
  { id: "sinterklaas", label: "Sinterklaas", hint: "Voor in de schoen of onder de zak" },
  { id: "kerst", label: "Kerst", hint: "Onder de boom" },
  { id: "babyshower", label: "Babyshower", hint: "Voor de aanstaande ouder" },
  { id: "geboorte", label: "Geboorte", hint: "Welkom, kleine" },
  { id: "anders", label: "Anders", hint: "Een eigen gelegenheid" },
];

export function isOccasionId(value: string): value is OccasionId {
  return OCCASIONS.some((occasion) => occasion.id === value);
}

export function occasionLabel(occasion: string, custom?: string | null) {
  if (occasion === "anders") {
    const text = custom?.trim();
    return text || "Anders";
  }
  return OCCASIONS.find((item) => item.id === occasion)?.label ?? "Gelegenheid";
}
