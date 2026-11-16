import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
  themeColor: "#fbf7f2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="nl" className={jakarta.variable}>
      <body className={`${jakarta.className} flex min-h-dvh flex-col`}>
        <a className="skip-link" href="#inhoud">
          Ga naar inhoud
        </a>
        <Header userName={user?.name ?? null} />
        <main id="inhoud" className="flex-1">
          {children}
        </main>
        <SiteFooter loggedIn={Boolean(user)} />
        <Toaster />
      </body>
    </html>
  );
}
