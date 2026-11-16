import assert from "node:assert/strict";
import { test } from "node:test";
import { addressIsBlocked, checkPublicUrl } from "./urls";

test("blocks private and local addresses", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.1.20", "172.16.0.4", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "fe80::1"]) {
    assert.equal(addressIsBlocked(ip), true, ip);
  }
  assert.equal(addressIsBlocked("::ffff:127.0.0.1"), true);
  assert.equal(addressIsBlocked("8.8.8.8"), false);
  assert.equal(addressIsBlocked("1.1.1.1"), false);
});

test("rejects urls the server should not fetch", () => {
  assert.equal(checkPublicUrl("http://127.0.0.1/latest").ok, false);
  assert.equal(checkPublicUrl("http://169.254.169.254/").ok, false);
  assert.equal(checkPublicUrl("http://localhost/cadeau").ok, false);
  assert.equal(checkPublicUrl("file:///etc/passwd").ok, false);
  assert.equal(checkPublicUrl("http://example.com:22/").ok, false);
  assert.equal(checkPublicUrl("https://user:pw@example.com/").ok, false);
  assert.equal(checkPublicUrl("https://www.bol.com/nl/nl/s/?searchtext=sokken").ok, true);
});
