type AffiliateEnv = {
  AMAZON_NL_ASSOCIATE_TAG?: string;
  BOL_SITE_ID?: string;
};

function bareHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function safeAmazonTag(value: string | undefined) {
  const tag = value?.trim() ?? "";
  return /^[A-Za-z0-9_-]{2,40}$/.test(tag) ? tag : null;
}

function safeBolSiteId(value: string | undefined) {
  const siteId = value?.trim() ?? "";
  return /^\d{3,12}$/.test(siteId) ? siteId : null;
}

/**
 * Adds platform affiliate parameters when rendering a shop link.
 * Stored URLs stay clean. Unknown shops are returned unchanged.
 */
export function applyAffiliate(
  rawUrl: string,
  env: AffiliateEnv = {
    AMAZON_NL_ASSOCIATE_TAG: process.env.AMAZON_NL_ASSOCIATE_TAG,
    BOL_SITE_ID: process.env.BOL_SITE_ID,
  },
): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return rawUrl;

  const host = bareHost(url.hostname);

  if (host === "amazon.nl" || host.endsWith(".amazon.nl")) {
    const tag = safeAmazonTag(env.AMAZON_NL_ASSOCIATE_TAG);
    if (!tag) return rawUrl;
    url.searchParams.set("tag", tag);
    return url.toString();
  }

  if (host === "bol.com") {
    const siteId = safeBolSiteId(env.BOL_SITE_ID);
    if (!siteId) return rawUrl;
    const partner = new URL("https://partner.bol.com/click/click");
    partner.searchParams.set("p", "1");
    partner.searchParams.set("t", "url");
    partner.searchParams.set("s", siteId);
    partner.searchParams.set("f", "TXL");
    partner.searchParams.set("url", url.toString());
    partner.searchParams.set("name", "wensenlijstje");
    return partner.toString();
  }

  return rawUrl;
}
