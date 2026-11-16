import type { OccasionId } from "@/lib/occasions";

export const occasionImages: Record<OccasionId, { src: string; alt: string }> = {
  verjaardag: { src: "/cadeaus/gelegenheid-verjaardag.svg", alt: "Illustratie van een verjaardagstaart" },
  sinterklaas: { src: "/cadeaus/gelegenheid-sinterklaas.svg", alt: "Illustratie van een mijter" },
  kerst: { src: "/cadeaus/gelegenheid-kerst.svg", alt: "Illustratie van een kerstboom" },
  babyshower: { src: "/cadeaus/gelegenheid-babyshower.svg", alt: "Illustratie van een babyfles" },
  geboorte: { src: "/cadeaus/gelegenheid-geboorte.svg", alt: "Illustratie van een wieg" },
  bruiloft: { src: "/cadeaus/gelegenheid-bruiloft.svg", alt: "Illustratie van twee ringen" },
  anders: { src: "/cadeaus/gelegenheid-anders.svg", alt: "Illustratie van een ster" },
};
