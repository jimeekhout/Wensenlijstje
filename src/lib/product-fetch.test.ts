import assert from "node:assert/strict";
import { test } from "node:test";
import { ProductFetchError, fetchProductHtml } from "./product-fetch";

test("does not fetch loopback or link-local addresses", async () => {
  for (const url of ["http://127.0.0.1/latest", "http://169.254.169.254/", "http://localhost/cadeau"]) {
    await assert.rejects(
      () => fetchProductHtml(url),
      (error: unknown) => error instanceof ProductFetchError && (error.code === "PRIVATE_URL" || error.code === "BAD_URL"),
    );
  }
});
