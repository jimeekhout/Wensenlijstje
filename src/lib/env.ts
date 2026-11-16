const DEV_AUTH_SECRET = "local-dev-only-not-for-production-secret";

export function resolveAuthSecret(secret: string | undefined, nodeEnv: string | undefined) {
  const value = secret?.trim() ?? "";
  if (nodeEnv === "production") {
    if (value.length < 32 || value.includes("not-for-production")) {
      throw new Error(
        "Set AUTH_SECRET to a random string of at least 32 characters. Generate one with: openssl rand -base64 32",
      );
    }
    return value;
  }
  if (value.length >= 16) return value;
  return DEV_AUTH_SECRET;
}

export function authSecret() {
  return resolveAuthSecret(process.env.AUTH_SECRET, process.env.NODE_ENV);
}

export function resolveAppUrl(value: string | undefined, nodeEnv: string | undefined) {
  const configured = value?.trim() ?? "";
  if (nodeEnv === "production") {
    let url: URL;
    try {
      url = new URL(configured);
    } catch {
      throw new Error("Set APP_URL to the public site origin, for example https://wensenlijstje.nl");
    }
    if (url.protocol !== "https:" || url.username || url.password || url.origin === "null") {
      throw new Error("APP_URL must be an https origin, for example https://wensenlijstje.nl");
    }
    return url.origin;
  }
  if (!configured) return null;
  return configured.replace(/\/$/, "");
}

export function configuredAppUrl() {
  return resolveAppUrl(process.env.APP_URL, process.env.NODE_ENV);
}
