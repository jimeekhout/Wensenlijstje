export const OWNER_COOKIE = "wl_owner";
export const VISITOR_COOKIE = "wl_visitor";

const MAX_OWNER_IDS = 50;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function parseOwnerIds(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^[\w-]{8,32}$/.test(part))
    .slice(0, MAX_OWNER_IDS);
}

export function serializeOwnerIds(ids: string[]): string {
  return Array.from(new Set(ids.filter(Boolean))).slice(-MAX_OWNER_IDS).join(",");
}

export function cookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  path: string;
  maxAge: number;
  secure: boolean;
} {
  const forced = process.env.COOKIE_SECURE;
  const secure = forced === "true" ? true : forced === "false" ? false : process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure,
  };
}
