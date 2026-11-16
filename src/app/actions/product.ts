"use server";

import { getCurrentUser } from "@/lib/auth";
import { formatPriceInput } from "@/lib/price";
import { ProductFetchError, loadProductPreview } from "@/lib/product-fetch";
import { createRateLimiter } from "@/lib/rate-limit";

const allowPreview = createRateLimiter({ limit: 20, windowMs: 60_000 });

type ProductPreviewResult =
  | {
      ok: true;
      url: string;
      name: string;
      description: string;
      imageUrl: string;
      price: string;
      message: string;
    }
  | { ok: false; message: string };

export async function previewProduct(url: string): Promise<ProductPreviewResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Log opnieuw in om een link op te halen." };
  if (!allowPreview(user.id)) {
    return {
      ok: false,
      message: "Je hebt net veel links opgehaald. Wacht een minuutje, of vul de gegevens zelf in.",
    };
  }
  if (url.trim().length > 2000) {
    return { ok: false, message: "Die link is te lang. Vul de gegevens zelf in." };
  }

  try {
    const product = await loadProductPreview(url);
    const found = Boolean(product.name || product.description || product.imageUrl || product.priceCents != null);
    if (!found) {
      return {
        ok: false,
        message:
          "We vonden geen productgegevens op deze pagina. De link kun je wel opslaan en de rest zelf invullen.",
      };
    }
    const partial = !product.name || !product.imageUrl || product.priceCents == null;
    return {
      ok: true,
      url: product.url,
      name: product.name ?? "",
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      price: product.priceCents != null ? formatPriceInput(product.priceCents) : "",
      message: partial
        ? "We konden een deel overnemen. Controleer de velden en vul aan wat ontbreekt."
        : "Gegevens overgenomen. Pas ze gerust aan voor je opslaat.",
    };
  } catch (error) {
    const code = error instanceof ProductFetchError ? error.code : "NETWORK";
    return { ok: false, message: previewMessage(code) };
  }
}

function previewMessage(code: ProductFetchError["code"] | "NETWORK") {
  if (code === "BAD_URL") return "Vul een geldige link in die begint met http:// of https://.";
  if (code === "PRIVATE_URL") {
    return "Die link kunnen we niet ophalen. Plak een openbare productpagina, of vul de gegevens zelf in.";
  }
  if (code === "TIMEOUT") {
    return "De webshop reageerde te langzaam. De link kun je wel opslaan en de rest zelf invullen.";
  }
  return "Ophalen is niet gelukt. De link kun je wel opslaan en de rest zelf invullen.";
}
