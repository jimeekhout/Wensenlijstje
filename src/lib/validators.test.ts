import assert from "node:assert/strict";
import { test } from "node:test";
import { parseItemInput, parseListInput } from "./validators";

test("requires a custom label for Anders", () => {
  const missing = parseListInput({
    title: "Housewarming",
    occasion: "anders",
    occasionCustom: "  ",
    eventDate: "",
  });
  assert.equal(missing.ok, false);

  const parsed = parseListInput({
    title: "  Housewarming bij Noor ",
    occasion: "anders",
    occasionCustom: " Housewarming ",
    eventDate: "2026-12-05",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.occasionCustom, "Housewarming");
    assert.equal(parsed.data.eventDate?.toISOString().slice(0, 10), "2026-12-05");
  }
});

test("keeps a shop link optional and public", () => {
  const blocked = parseItemInput({
    name: "Sokken",
    description: "",
    url: "http://127.0.0.1/geheim",
    imageUrl: "",
    price: "",
    priority: "",
  });
  assert.equal(blocked.ok, false);

  const parsed = parseItemInput({
    name: "Sokken",
    description: "",
    url: "https://www.bol.com/nl/nl/s/?searchtext=sokken",
    imageUrl: "",
    price: "12,50",
    priority: "3",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.data.priceCents, 1250);
});
