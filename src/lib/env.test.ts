import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAppUrl, resolveAuthSecret } from "./env";

test("production requires a real auth secret and https app url", () => {
  assert.throws(() => resolveAuthSecret("short", "production"));
  assert.throws(() => resolveAuthSecret("local-dev-only-not-for-production-secret", "production"));
  assert.equal(resolveAuthSecret("a".repeat(32), "production"), "a".repeat(32));

  assert.throws(() => resolveAppUrl("http://localhost:3000", "production"));
  assert.equal(resolveAppUrl("https://hetwensenlijstje.nl/", "production"), "https://hetwensenlijstje.nl");
});

test("development can run without production secrets", () => {
  assert.equal(resolveAuthSecret(undefined, "development").includes("not-for-production"), true);
  assert.equal(resolveAppUrl(undefined, "development"), null);
  assert.equal(resolveAppUrl("http://localhost:3000/", "development"), "http://localhost:3000");
});
