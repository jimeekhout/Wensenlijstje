import { createHmac, timingSafeEqual } from "node:crypto";
import { authSecret } from "@/lib/env";

/** HMAC of a session token or claim secret. The raw value stays in an httpOnly cookie. */
export function hashSecret(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

export function hashesEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function secretMatches(secret: string, secretHash: string) {
  return hashesEqual(hashSecret(secret), secretHash);
}
