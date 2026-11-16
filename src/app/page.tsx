import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { absolute: "hetwensenlijstje.nl — deel een wensenlijstje, bewaar de verrassing" },
  description:
    "Maak een gratis wensenlijstje voor Sinterklaas, Kerst, een verjaardag of een bruiloft. Deel één link. Gasten hebben geen account nodig en jij ziet niet wat ze afstrepen.",
  openGraph: {
    title: "hetwensenlijstje.nl — deel een wensenlijstje, bewaar de verrassing",
    description:
      "Maak een gratis wensenlijstje. Deel één link via WhatsApp of een QR-code. Gasten hebben geen account nodig.",
  },
};

export default async function HomePage() {
  const user = await getCurrentUser();
  return <Landing userName={user?.name ?? null} />;
}
