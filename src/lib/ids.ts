import { randomBytes } from "node:crypto";

export function createPublicId(): string {
  return randomBytes(9).toString("base64url");
}

export function createSecret(): string {
  return randomBytes(24).toString("base64url");
}
