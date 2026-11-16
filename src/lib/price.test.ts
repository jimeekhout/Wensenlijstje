import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMetadataPriceToCents, parsePriceToCents } from "./price";

test("parses Dutch prices", () => {
  assert.equal(parsePriceToCents("19,95"), 1995);
  assert.equal(parsePriceToCents("€ 19,95"), 1995);
  assert.equal(parsePriceToCents("19.95"), 1995);
  assert.equal(parsePriceToCents("1.299,00"), 129900);
  assert.equal(parsePriceToCents("1,299.00"), 129900);
  assert.equal(parsePriceToCents("12,5"), 1250);
  assert.equal(parsePriceToCents("0"), 0);
  assert.equal(parsePriceToCents(""), null);
  assert.equal(parsePriceToCents("abc"), null);
  assert.equal(parsePriceToCents("-5"), null);
});

test("parses metadata prices with a dot decimal", () => {
  assert.equal(parseMetadataPriceToCents("19.95"), 1995);
  assert.equal(parseMetadataPriceToCents("EUR 19,95"), 1995);
  assert.equal(parseMetadataPriceToCents("1.234"), 123);
});
