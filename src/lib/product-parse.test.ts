import assert from "node:assert/strict";
import { test } from "node:test";
import { parseProductHtml } from "./product-parse";

const html = `<!doctype html>
<html><head>
  <title>Houten treinset | Voorbeeldwinkel</title>
  <meta property="og:site_name" content="Voorbeeldwinkel" />
  <meta property="og:title" content="Fallback titel" />
  <meta property="og:description" content="Alleen gebruikt zonder JSON-LD." />
  <meta property="og:image" content="/plaatjes/fallback.jpg" />
  <meta property="product:price:amount" content="12.00" />
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [] }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [{
        "@type": "Product",
        "name": "Houten treinset",
        "description": "Een <b>houten</b> trein met rails.",
        "image": ["/img/trein.jpg"],
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": "49.95",
          "availability": "https://schema.org/InStock"
        }
      }]
    }
  </script>
</head><body></body></html>`;

test("reads JSON-LD product data and resolves the image", () => {
  const product = parseProductHtml(html, "https://winkel.example/p/trein");
  assert.equal(product.name, "Houten treinset");
  assert.equal(product.description, "Een houten trein met rails.");
  assert.equal(product.imageUrl, "https://winkel.example/img/trein.jpg");
  assert.equal(product.priceCents, 4995);
});

test("falls back to Open Graph when JSON-LD is broken", () => {
  const broken = `<!doctype html><html><head>
    <title>Warme sloffen | Voorbeeldwinkel</title>
    <meta property="og:site_name" content="Voorbeeldwinkel" />
    <meta property="og:title" content="Warme sloffen | Voorbeeldwinkel" />
    <meta property="og:description" content="Zachte sloffen voor binnen." />
    <meta property="og:image" content="https://cdn.example/sloffen.jpg" />
    <meta property="product:price:amount" content="14.50" />
    <meta property="product:price:currency" content="EUR" />
    <script type="application/ld+json">{ this is not json</script>
  </head></html>`;
  const product = parseProductHtml(broken, "https://winkel.example/sloffen");
  assert.equal(product.name, "Warme sloffen");
  assert.equal(product.description, "Zachte sloffen voor binnen.");
  assert.equal(product.imageUrl, "https://cdn.example/sloffen.jpg");
  assert.equal(product.priceCents, 1450);
});

test("ignores a price in another currency", () => {
  const dollars = `<!doctype html><html><head>
    <meta property="og:title" content="Koptelefoon" />
    <script type="application/ld+json">
      { "@type": "Product", "name": "Koptelefoon", "offers": { "@type": "Offer", "price": "20.00", "priceCurrency": "USD" } }
    </script>
  </head></html>`;
  const product = parseProductHtml(dollars, "https://winkel.example/audio");
  assert.equal(product.name, "Koptelefoon");
  assert.equal(product.priceCents, null);
});
