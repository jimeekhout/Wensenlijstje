import assert from "node:assert/strict";
import { test } from "node:test";
import { filterGiftIdeas } from "./gift-filter";

const ideas = [
  { id: "sok", recipients: ["man"], occasions: ["kerst"], interests: ["mode"], priceCents: 1200 },
  { id: "trein", recipients: ["kind"], occasions: ["sinterklaas"], interests: ["spelen"], priceCents: 4900 },
  { id: "koffie", recipients: ["vrouw"], occasions: ["verjaardag"], interests: ["koken"], priceCents: 14900 },
];

test("combines recipient, occasion, budget and any matching interest", () => {
  const kids = filterGiftIdeas(ideas, {
    recipient: "kind",
    occasion: "sinterklaas",
    ageGroup: null,
    budgetId: "30-50",
    interests: ["spelen", "muziek"],
  });
  assert.deepEqual(kids.map((idea) => idea.id), ["trein"]);

  const none = filterGiftIdeas(ideas, {
    recipient: "baby",
    occasion: null,
    ageGroup: null,
    budgetId: "all",
    interests: [],
  });
  assert.equal(none.length, 0);
});
