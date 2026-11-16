import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { parseProductHtml } from "@/lib/product-parse";
import { addressIsBlocked, checkPublicUrl } from "@/lib/urls";

const MAX_BYTES = 2_500_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "Mozilla/5.0 (compatible; Wensenlijstje/1.0; +https://wensenlijstje.nl)";

export class ProductFetchError extends Error {
  code: "BAD_URL" | "PRIVATE_URL" | "TIMEOUT" | "NOT_HTML" | "HTTP" | "TOO_LARGE" | "TOO_MANY_REDIRECTS" | "NETWORK";

  constructor(code: ProductFetchError["code"]) {
    super(code);
    this.name = "ProductFetchError";
    this.code = code;
  }
}

type Fetched = {
  status: number;
  location?: string;
  contentType: string;
  body: Buffer;
};

export async function fetchProductHtml(rawUrl: string) {
  let current = rawUrl.trim();
  const deadline = Date.now() + 12_000;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const checked = checkPublicUrl(current);
    if (!checked.ok) throw new ProductFetchError(checked.code);
    const addresses = await resolvePublicAddresses(checked.url.hostname);
    const response = await requestPinned(checked.url, addresses, deadline);

    if (response.status >= 300 && response.status < 400) {
      if (hop === MAX_REDIRECTS) throw new ProductFetchError("TOO_MANY_REDIRECTS");
      if (!response.location) throw new ProductFetchError("HTTP");
      current = new URL(response.location, checked.url).toString();
      continue;
    }

    if (response.status < 200 || response.status >= 300) throw new ProductFetchError("HTTP");

    const head = response.body.slice(0, 400).toString("utf8").toLowerCase();
    const type = response.contentType.toLowerCase();
    const looksHtml =
      type.includes("text/html") ||
      type.includes("application/xhtml") ||
      head.includes("<!doctype html") ||
      head.includes("<html");
    if (!looksHtml) throw new ProductFetchError("NOT_HTML");

    return {
      html: decodeBody(response.body, response.contentType),
      finalUrl: checked.url.toString(),
    };
  }

  throw new ProductFetchError("TOO_MANY_REDIRECTS");
}

export async function loadProductPreview(rawUrl: string) {
  const { html, finalUrl } = await fetchProductHtml(rawUrl);
  const draft = parseProductHtml(html, finalUrl);
  return {
    name: draft.name,
    description: draft.description,
    imageUrl: draft.imageUrl,
    priceCents: draft.priceCents,
    url: preferredUrl(draft.canonicalUrl, finalUrl),
  };
}

function preferredUrl(canonical: string | null, finalUrl: string) {
  if (!canonical) return finalUrl;
  try {
    const target = new URL(canonical, finalUrl);
    const final = new URL(finalUrl);
    if (target.hostname !== final.hostname) return finalUrl;
    return checkPublicUrl(target.toString()).ok ? target.toString() : finalUrl;
  } catch {
    return finalUrl;
  }
}

async function resolvePublicAddresses(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (addressIsBlocked(host)) throw new ProductFetchError("PRIVATE_URL");
    return [host];
  }

  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new ProductFetchError("NETWORK");
  }
  const addresses = records.map((record) => record.address);
  if (addresses.length === 0 || addresses.some((address) => addressIsBlocked(address))) {
    throw new ProductFetchError(addresses.length === 0 ? "NETWORK" : "PRIVATE_URL");
  }
  const ipv4 = addresses.filter((address) => !address.includes(":"));
  const ipv6 = addresses.filter((address) => address.includes(":"));
  return [...ipv4, ...ipv6];
}

async function requestPinned(url: URL, addresses: string[], deadline: number) {
  let last: unknown;
  for (const address of addresses.slice(0, 2)) {
    const remaining = deadline - Date.now();
    if (remaining <= 250) throw new ProductFetchError("TIMEOUT");
    try {
      return await requestOnce(url, address, Math.min(remaining, 8_000));
    } catch (error) {
      if (
        error instanceof ProductFetchError &&
        error.code !== "NETWORK" &&
        error.code !== "TIMEOUT"
      ) {
        throw error;
      }
      last = error;
      if (error instanceof ProductFetchError && error.code === "TIMEOUT") throw error;
    }
  }
  if (last instanceof ProductFetchError) throw last;
  throw new ProductFetchError("NETWORK");
}

function requestOnce(url: URL, address: string, timeoutMs: number) {
  return new Promise<Fetched>((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        host: address,
        servername: url.hostname.replace(/^\[|\]$/g, ""),
        family: address.includes(":") ? 6 : 4,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        method: "GET",
        path: `${url.pathname || "/"}${url.search}`,
        headers: {
          Host: url.host,
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "close",
        },
        timeout: timeoutMs,
        rejectUnauthorized: true,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          const location = res.headers.location;
          res.resume();
          resolve({
            status,
            location: Array.isArray(location) ? location[0] : location,
            contentType: "",
            body: Buffer.alloc(0),
          });
          return;
        }

        const encoding = String(res.headers["content-encoding"] || "identity").toLowerCase();
        let stream: NodeJS.ReadableStream = res;
        if (encoding.includes("gzip")) stream = res.pipe(createGunzip());
        else if (encoding.includes("br")) stream = res.pipe(createBrotliDecompress());
        else if (encoding.includes("deflate")) stream = res.pipe(createInflate());
        else if (!encoding.includes("identity")) {
          res.resume();
          reject(new ProductFetchError("NOT_HTML"));
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        stream.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            req.destroy();
            reject(new ProductFetchError("TOO_LARGE"));
            return;
          }
          chunks.push(chunk);
        });
        stream.on("end", () => {
          resolve({
            status,
            contentType: String(res.headers["content-type"] || ""),
            body: Buffer.concat(chunks),
          });
        });
        stream.on("error", () => reject(new ProductFetchError("NETWORK")));
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new ProductFetchError("TIMEOUT"));
    });
    req.on("error", () => reject(new ProductFetchError("NETWORK")));
    req.end();
  });
}

function decodeBody(body: Buffer, contentType: string) {
  const match = /charset=([^;]+)/i.exec(contentType);
  const charset = match?.[1]?.trim().replace(/["']/g, "") || "utf-8";
  try {
    return new TextDecoder(charset).decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}
