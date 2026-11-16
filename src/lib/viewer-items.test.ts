import assert from "node:assert/strict";
import { test } from "node:test";
import { hashSecret } from "./hash";
import { buildViewerItems } from "./viewer-items";

const items = [{ id: "trein" }, { id: "sloffen" }];
const claims = [{ itemId: "sloffen", claimerName: "Oma Ineke", secretHash: hashSecret("geheim") }];

test("hides every claim from the owner, including the secret", () => {
  const visible = buildViewerItems(items, claims, {
    hideClaims: true,
    secretsByItemId: { sloffen: "geheim" },
  });
  assert.deepEqual(
    visible.map((item) => item.claim),
    [null, null],
  );
  assert.equal(JSON.stringify(visible).includes("Oma Ineke"), false);
  assert.equal(JSON.stringify(visible).includes("secretHash"), false);
});

test("shows the claimer to visitors and recognises their own claim", () => {
  const visible = buildViewerItems(items, claims, {
    hideClaims: false,
    secretsByItemId: { sloffen: "geheim" },
  });
  assert.equal(visible[0].claim, null);
  assert.deepEqual(visible[1].claim, { claimerName: "Oma Ineke", claimedByYou: true });
  assert.equal(JSON.stringify(visible).includes(claims[0].secretHash), false);
});
