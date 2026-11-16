import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Header } from "@/components/header";
import { LogoMark } from "@/components/logo-mark";
import { Toaster } from "@/components/toaster";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "hetwensenlijstje.nl",
    template: "%s · hetwensenlijstje.nl",
  },
  description:
    "Maak een wensenlijstje en deel het met familie en vrienden, zonder de verrassing te bederven.",
  applicationName: "hetwensenlijstje.nl",
  openGraph: {
    title: "hetwensenlijstje.nl",
    description: "Deel je wensen, bewaar de verrassing.",
    siteName: "hetwensenlijstje.nl",
    locale: "nl_NL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff6ee",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="nl" className={`${nunito.variable} ${fredoka.variable}`}>
      <body className={`${nunito.className} flex min-h-dvh flex-col`}>
        <a className="skip-link" href="#inhoud">
          Ga naar inhoud
        </a>
        <Header userName={user?.name ?? null} />
        <main id="inhoud" className="flex-1">
          {children}
        </main>
        <footer className="site-footer">
          <LogoMark className="footer-mark" />
          <p>hetwensenlijstje.nl · wensen delen, verrassingen bewaren</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
