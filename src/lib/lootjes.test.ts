import assert from "node:assert/strict";
import { test } from "node:test";
import { canRedraw, drawAssignments, hideAssignments } from "./lootjes";

test("nobody draws themselves", () => {
  const ids = ["a", "b", "c", "d"];
  for (let i = 0; i < 30; i += 1) {
    const result = drawAssignments(ids);
    assert.ok(result);
    for (const id of ids) assert.notEqual(result[id], id);
    assert.equal(new Set(Object.values(result)).size, ids.length);
  }
});

test("respects mutual exclusions and reports an impossible draw", () => {
  const result = drawAssignments(["a", "b", "c", "d"], [{ a: "a", b: "b" }]);
  assert.ok(result);
  assert.notEqual(result.a, "b");
  assert.notEqual(result.b, "a");
  assert.equal(drawAssignments(["a", "b"], [{ a: "a", b: "b" }]), null);
  assert.equal(drawAssignments(["only"]), null);
});

test("redraw stays possible until someone has looked", () => {
  assert.equal(canRedraw({ drawnAt: new Date(), viewedCount: 0 }), true);
  assert.equal(canRedraw({ drawnAt: new Date(), viewedCount: 1 }), false);
  assert.equal(canRedraw({ drawnAt: null, viewedCount: 0 }), false);
});

test("organiser view drops the assignment column", () => {
  const visible = hideAssignments([
    { id: "a", name: "Ada", drawsParticipantId: "b" },
    { id: "b", name: "Ben", drawsParticipantId: "a" },
  ]);
  assert.equal(JSON.stringify(visible).includes("drawsParticipantId"), false);
  assert.equal(JSON.stringify(visible).includes("Ben"), true);
});
