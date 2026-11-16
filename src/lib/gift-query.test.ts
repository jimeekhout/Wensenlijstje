import assert from "node:assert/strict";
import { test } from "node:test";
import { giftQueryString, parseGiftQuery } from "./gift-query";
import { sortGiftIdeas } from "./gift-filter";

test("reads and writes shareable catalogue params", () => {
  const query = parseGiftQuery(new URLSearchParams("q=sokken&voor=koppel&gelegenheid=bruiloft&leeftijd=18%2B&budget=30-50&categorie=wonen,onzin&sorteer=prijs-af"));
  assert.equal(query.q, "sokken");
  assert.equal(query.recipient, "koppel");
  assert.equal(query.occasion, "bruiloft");
  assert.equal(query.ageGroup, "18+");
  assert.equal(query.budgetId, "30-50");
  assert.deepEqual(query.categories, ["wonen"]);
  assert.equal(query.sort, "prijs-af");
  const again = parseGiftQuery(new URLSearchParams(giftQueryString(query).slice(1)));
  assert.deepEqual(again, query);
});

test("drops unknown params and defaults the sort", () => {
  const query = parseGiftQuery(new URLSearchParams("voor=robot&sorteer=nieuw"));
  assert.equal(query.recipient, null);
  assert.equal(query.sort, "populair");
  assert.equal(giftQueryString(query), "");
});

test("sorts popular gifts before cheaper ones", () => {
  const ideas = [
    { name: "A", recipients: [], occasions: [], interests: [], priceCents: 100, popularity: 1 },
    { name: "B", recipients: [], occasions: [], interests: [], priceCents: 500, popularity: 9 },
  ];
  assert.deepEqual(sortGiftIdeas(ideas, "populair").map((idea) => idea.name), ["B", "A"]);
  assert.deepEqual(sortGiftIdeas(ideas, "prijs-op").map((idea) => idea.name), ["A", "B"]);
});
