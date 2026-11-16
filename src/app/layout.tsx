import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "hetwensenlijstje.nl",
    template: "%s · hetwensenlijstje.nl",
  },
  description:
    "Maak een wensenlijstje en deel het met familie en vrienden, zonder de verrassing te bederven.",
  applicationName: "hetwensenlijstje.nl",
};

export const viewport: Viewport = {
  themeColor: "#f3ebdd",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="nl" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className={`${figtree.className} flex min-h-dvh flex-col`}>
        <a className="skip-link" href="#inhoud">
          Ga naar inhoud
        </a>
        <Header userName={user?.name ?? null} />
        <main id="inhoud" className="flex-1">
          {children}
        </main>
        <footer className="site-footer">hetwensenlijstje.nl · wensen delen, verrassingen bewaren</footer>
      </body>
    </html>
  );
}
