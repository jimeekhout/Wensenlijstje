import assert from "node:assert/strict";
import { test } from "node:test";
import { applyAffiliate } from "./affiliate";

test("leaves shop links unchanged without affiliate settings", () => {
  const url = "https://www.amazon.nl/s?k=sokken";
  assert.equal(applyAffiliate(url, {}), url);
  assert.equal(applyAffiliate("https://www.bol.com/nl/nl/s/?searchtext=sokken", {}), "https://www.bol.com/nl/nl/s/?searchtext=sokken");
});

test("adds an Amazon tag and wraps bol.com", () => {
  const amazon = applyAffiliate("https://www.amazon.nl/s?k=sokken", { AMAZON_NL_ASSOCIATE_TAG: "wens-21" });
  assert.equal(new URL(amazon).searchParams.get("tag"), "wens-21");

  const bol = applyAffiliate("https://www.bol.com/nl/nl/p/voorbeeld/123/", { BOL_SITE_ID: "123456" });
  const wrapped = new URL(bol);
  assert.equal(wrapped.hostname, "partner.bol.com");
  assert.equal(wrapped.searchParams.get("s"), "123456");
  assert.equal(wrapped.searchParams.get("url"), "https://www.bol.com/nl/nl/p/voorbeeld/123/");
});

test("ignores unsafe affiliate settings and other shops", () => {
  const url = "https://www.hema.nl/cadeau";
  assert.equal(applyAffiliate(url, { AMAZON_NL_ASSOCIATE_TAG: "no spaces", BOL_SITE_ID: "nope" }), url);
});
