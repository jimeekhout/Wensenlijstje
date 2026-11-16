import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.internal",
]);

export type UrlCheck =
  | { ok: true; url: URL }
  | { ok: false; code: "BAD_URL" | "PRIVATE_URL" };

export function addressIsBlocked(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^::ffff:/, "");
  if (normalized.includes(":")) return ipv6IsBlocked(normalized);
  return ipv4IsBlocked(normalized);
}

function ipv4IsBlocked(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51) return true;
  if (a === 203 && b === 0) return true;
  if (a >= 224) return true;
  return false;
}

function ipv6IsBlocked(ip: string) {
  if (ip === "::" || ip === "::1") return true;
  const first = ip.split(":")[0] || "0";
  const head = Number.parseInt(first, 16);
  if (!Number.isFinite(head)) return true;
  // fc00::/7 unique local, fe80::/10 link-local, ff00::/8 multicast, 2001:db8 documentation
  if ((head & 0xfe00) === 0xfc00) return true;
  if ((head & 0xffc0) === 0xfe80) return true;
  if ((head & 0xff00) === 0xff00) return true;
  if (ip.startsWith("2001:db8")) return true;
  // Global unicast is 2000::/3.
  if (head < 0x2000 || head > 0x3fff) return true;
  return false;
}

export function checkPublicUrl(input: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, code: "BAD_URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, code: "BAD_URL" };
  }
  if (url.username || url.password) return { ok: false, code: "PRIVATE_URL" };

  const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
  if (port !== 80 && port !== 443) return { ok: false, code: "PRIVATE_URL" };

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname.endsWith(".") || hostname.length > 253) {
    return { ok: false, code: "BAD_URL" };
  }
  if (
    BLOCKED_HOSTS.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".home.arpa")
  ) {
    return { ok: false, code: "PRIVATE_URL" };
  }

  if (isIP(hostname) && addressIsBlocked(hostname)) {
    return { ok: false, code: "PRIVATE_URL" };
  }

  return { ok: true, url };
}

export function shopLabel(rawUrl: string) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "bol.com" || host.endsWith(".bol.com") || host === "partner.bol.com") {
      return "Bekijk bij bol.com";
    }
    if (host === "amazon.nl" || host.endsWith(".amazon.nl")) {
      return "Bekijk bij Amazon.nl";
    }
  } catch {
    return "Bekijk in de winkel";
  }
  return "Bekijk in de winkel";
}
