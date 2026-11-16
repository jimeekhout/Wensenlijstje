import assert from "node:assert/strict";
import { test } from "node:test";
import { getGiftIdea, giftIdeas } from "./gift-ideas";

test("the placeholder catalog is valid and editable by id", () => {
  assert.ok(giftIdeas.length >= 20);
  assert.ok(getGiftIdea("wollen-sokken"));
  assert.equal(getGiftIdea("bestaat-niet"), null);
  for (const idea of giftIdeas) {
    assert.equal(idea.name.includes("PLACEHOLDER"), false);
    assert.ok(idea.priceCents > 0);
  }
});
