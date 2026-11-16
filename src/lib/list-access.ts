import { hashSecret, secretMatches } from "@/lib/hash";

export function listAccessCookieName(shareToken: string) {
  return `wens_lijst_${shareToken}`;
}

export function listAccessToken(shareToken: string, accessHash: string) {
  return hashSecret(`${shareToken}:${accessHash}`);
}

export function hasListAccess(cookieValue: string | undefined, shareToken: string, accessHash: string) {
  if (!cookieValue) return false;
  return secretMatches(`${shareToken}:${accessHash}`, cookieValue);
}
